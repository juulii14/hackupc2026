import { NextResponse } from 'next/server';
import { skyscannerService } from '@/lib/skyscanner';

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { cityCode, adults, date, originCode } = body;

    // 1. Lógica de Destino (IATA)
    let destinationIata = cityCode;
    if (!cityCode || cityCode.length > 3) {
      const detected = await skyscannerService.getIataCode(cityCode);
      destinationIata = detected || 'CUN'; // Fallback a Cancún si no se encuentra
    }

    // 2. Lógica de Origen
    const finalOrigin = originCode || 'BCN';

    // Evitar que origen y destino sean iguales
    if (finalOrigin.toUpperCase() === destinationIata.toUpperCase()) {
      destinationIata = (finalOrigin === 'BCN') ? 'MAD' : 'BCN';
    }

    console.log(`✈️ Buscando: ${finalOrigin} a ${destinationIata} para el ${date} con ${adults} adultos`);

    // 3. Crear sesión con datos dinámicos
    const sessionData = await skyscannerService.createFlightSearch({
      originCode: finalOrigin, 
      destCode: destinationIata,
      adults: adults || 1,
      date: date
    });

    const sessionToken = sessionData.sessionToken;

    if (!sessionToken) {
      return NextResponse.json({ error: "No session token", details: sessionData }, { status: 500 });
    }

    // 4. ESPERA Y OBTENCIÓN DE RESULTADOS
    await sleep(2000);
    let flights = await skyscannerService.getSearchUpdate(sessionToken);

    if (flights.length === 0) {
      await sleep(2000);
      flights = await skyscannerService.getSearchUpdate(sessionToken);
    }

    return NextResponse.json(flights);

  } catch (error: any) {
    console.error("🔥 Error crítico:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}