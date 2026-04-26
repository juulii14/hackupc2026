import { NextResponse } from 'next/server';
import { skyscannerService } from '@/lib/skyscanner';

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function POST(req: Request) {
  try {
    const { cityCode, adults, date, originCode } = await req.json();

    if (!cityCode || !date) {
      return NextResponse.json({ error: "Destination or date missing" }, { status: 400 });
    }

    // 1. IATA Dinámico (No más Madrid fijo)
    let destinationIata = '';
    if (cityCode?.length === 3 && cityCode === cityCode.toUpperCase()) {
      destinationIata = cityCode; 
    } else {
      const detected = await skyscannerService.getIataCode(cityCode);
      if (!detected) throw new Error(`No IATA code was found for: ${cityCode}`);
      destinationIata = detected;
    }

    // 2. Crear búsqueda
    let sessionData = await skyscannerService.createFlightSearch({
      originCode: originCode || 'BCN',
      destCode: destinationIata,
      adults: Number(adults) || 1,
      date: date
    });

    if (!sessionData.sessionToken) {
      await new Promise(res => setTimeout(res, 2000));
      sessionData = await skyscannerService.createFlightSearch({
        originCode: originCode || 'BCN',
        destCode: destinationIata,
        adults: Number(adults) || 1,
        date: date
      });
    }


    const token = sessionData.sessionToken;
    if (!token) return NextResponse.json({ error: "Internal Error" }, { status: 500 });

    // 3. Polling con reintentos
    await sleep(1500);
    let flights = await skyscannerService.getSearchUpdate(token);

    if (flights.length === 0) {
      await sleep(2500); // Damos más tiempo si no hay nada
      flights = await skyscannerService.getSearchUpdate(token);
    }

    // Filtrar per data exacta
    const [year, month, day] = date.split('-').map(Number);
    flights = flights.filter((flight: any) => {
      if (!flight.departure) return true;
      const flightDate = new Date(flight.departure);
      return (
        flightDate.getFullYear() === year &&
        flightDate.getMonth() + 1 === month &&
        flightDate.getDate() === day
      );
    });

    return NextResponse.json(flights);

  } catch (error: any) {
    console.error("API Route Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}