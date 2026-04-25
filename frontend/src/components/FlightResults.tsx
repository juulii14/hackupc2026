// app/api/flights/route.ts
import { NextResponse } from 'next/server';
import { skyscannerService } from '@/lib/skyscanner';
import { FlightResultData } from '@/types/flight';

export async function POST(req: Request) {
  try {
    const { cityCode, adults, date } = await req.json();

    if (!cityCode || !date) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    // 1. Crear sesión
    const sessionData = await skyscannerService.createFlightSearch({
      originCode: 'BCN', // Cambiado a BCN por coherencia con el proyecto, o MAD
      destCode: cityCode,
      adults: adults || 1,
      date: date
    });

    const sessionToken = sessionData.sessionToken;
    if (!sessionToken) throw new Error("No session token received");

    // 2. Poll (Intento simplificado)
    const API_KEY = process.env.SKYSCANNER_KEY;
    
    // Esperamos un poco para que Skyscanner tenga algo que darnos
    await new Promise(resolve => setTimeout(resolve, 1500));

    const pollResponse = await fetch(
      `https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/poll/${sessionToken}`,
      {
        method: 'POST',
        headers: { 
          'x-api-key': API_KEY!,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await pollResponse.json();

    // 3. Transformar resultados
    const formattedFlights = parseSkyscannerResults(data);

    // Si no hay vuelos, devolvemos un 200 con array vacío para que el frontal no explote
    return NextResponse.json(formattedFlights);

  } catch (error: any) {
    console.error("CRITICAL API ERROR:", error.message);
    return NextResponse.json({ error: 'Error obteniendo vuelos' }, { status: 500 });
  }
}

function parseSkyscannerResults(data: any): FlightResultData[] {
  const results = data.content?.results;
  if (!results || !results.itineraries) return [];

  const { itineraries, legs, carriers, places } = results;

  return Object.values(itineraries).map((item: any) => {
    const legId = item.legIds[0];
    const leg = legs[legId];
    const carrierId = leg.marketingCarrierIds[0];
    const carrier = carriers[carrierId];
    
    // Opcional: Obtener nombre de aeropuertos desde 'places'
    const originName = places[leg.originPlaceId]?.name || leg.originPlaceId;
    const destName = places[leg.destinationPlaceId]?.name || leg.destinationPlaceId;

    return {
      id: item.id,
      price: item.pricingOptions[0]?.price?.amount / 1000, 
      currency: 'EUR',
      origin: originName,
      destination: destName,
      departure: leg.departureDateTime,
      arrival: leg.arrivalDateTime,
      stops: leg.stopCount,
      durationMinutes: leg.durationInMinutes,
      airlineName: carrier?.name || 'Multiple Airlines',
      airlineLogo: carrier?.imageUrl || 'https://www.skyscanner.net/images/airline_logos/default.png',
      bookingUrl: item.pricingOptions[0]?.items[0]?.deepLink
    };
  }).sort((a, b) => a.price - b.price).slice(0, 5); // Solo los 5 más baratos
}