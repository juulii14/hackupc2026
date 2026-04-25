import { NextResponse } from 'next/server';
import { skyscannerService } from '@/lib/skyscanner'; 
import { FlightResultData } from '@/types/flight'; 

export async function POST(req: Request) {
  try {
    const { city, adults, date } = await req.json();

    if (!city || !date) {
      return NextResponse.json({ error: 'Faltan datos (city o date)' }, { status: 400 });
    }

    // --- REPARACIÓN: Obtener el código IATA a partir del nombre de la ciudad ---
    const cityCode = await skyscannerService.getIataCode(city);
    
    if (!cityCode) {
      return NextResponse.json({ error: `No se encontró aeropuerto para ${city}` }, { status: 404 });
    }

    // 1. Crear la sesión de búsqueda
    const sessionData = await skyscannerService.createFlightSearch({
      originCode: 'MAD', 
      destCode: cityCode,
      adults: adults || 1,
      date: date
    });

    const sessionToken = sessionData.sessionToken;
    if (!sessionToken) {
      return NextResponse.json({ error: 'No se pudo generar el token' }, { status: 500 });
    }

    // 2. Poll de resultados
    const API_KEY = process.env.SKYSCANNER_KEY!;
    const pollResponse = await fetch(
      `https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/poll/${sessionToken}`,
      {
        method: 'POST',
        headers: { 
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await pollResponse.json();

    // 3. Mapear resultados (Solo si hay contenido)
    if (!data.content?.results?.itineraries) {
        return NextResponse.json([]); 
    }

    const formattedFlights: FlightResultData[] = parseSkyscannerResults(data);
    return NextResponse.json(formattedFlights);

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

function parseSkyscannerResults(data: any): FlightResultData[] {
  const { itineraries, legs, carriers } = data.content.results;
  if (!itineraries) return [];

  return Object.values(itineraries).map((item: any) => {
    const leg = legs[item.legIds[0]];
    const carrier = carriers[leg.marketingCarrierIds[0]];

    return {
      id: item.id,
      price: item.pricingOptions[0]?.price?.amount / 1000, 
      currency: 'EUR',
      origin: leg.originPlaceId,
      destination: leg.destinationPlaceId,
      departure: leg.departureDateTime,
      arrival: leg.arrivalDateTime,
      stops: leg.stopCount,
      durationMinutes: leg.durationInMinutes,
      airlineName: carrier?.name || 'Aerolínea',
      airlineLogo: carrier?.imageUrl,
      bookingUrl: item.pricingOptions[0]?.items[0]?.deepLink
    };
  });
}