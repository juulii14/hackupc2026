import { NextResponse } from 'next/server';
import { skyscannerService } from '@/lib/skyscanner';

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cityCode, adults, date, originCode } = body;

    // 1. Lógica de Destino: Convertir el nombre de ciudad a IATA
    // cityCode aquí es el nombre de la ciudad que nos pasó el backend (ej: "Paris")
    let destinationIata = '';
    
    if (cityCode && cityCode.length === 3 && cityCode === cityCode.toUpperCase()) {
      destinationIata = cityCode; // Ya era un IATA
    } else {
      const detected = await skyscannerService.getIataCode(cityCode);
      if (!detected) {
        throw new Error(`No se pudo encontrar el código de aeropuerto para: ${cityCode}`);
      }
      destinationIata = detected;
    }

    // 2. Lógica de Origen (Predeterminado a BCN)
    const finalOrigin = originCode || 'BCN';

    // Evitar que origen y destino sean el mismo
    if (finalOrigin.toUpperCase() === destinationIata.toUpperCase()) {
      return NextResponse.json({ 
        error: "El origen y el destino coinciden. Por favor, elige otra ciudad." 
      }, { status: 400 });
    }

    console.log(`✈️ Buscando: ${finalOrigin} -> ${destinationIata} | Fecha: ${date} | Adultos: ${adults}`);

    // 3. Crear sesión en Skyscanner con los datos reales
    const sessionData = await skyscannerService.createFlightSearch({
      originCode: finalOrigin, 
      destCode: destinationIata,
      adults: Number(adults) || 1,
      date: date
    });

    const sessionToken = sessionData.sessionToken;

    if (!sessionToken) {
      return NextResponse.json({ 
        error: "No se pudo iniciar la sesión de búsqueda", 
        details: sessionData 
      }, { status: 500 });
    }

    // 4. ESPERA Y OBTENCIÓN DE RESULTADOS
    // Damos 2 segundos para que la API de Skyscanner encuentre ofertas iniciales
    await sleep(2000);
    let flights = await skyscannerService.getSearchUpdate(sessionToken);

    // Si no hay vuelos aún, esperamos un poco más (Skyscanner es asíncrono)
    if (!flights || flights.length === 0) {
      await sleep(2000);
      flights = await skyscannerService.getSearchUpdate(sessionToken);
    }

    return NextResponse.json(flights);

  } catch (error: any) {
    console.error("🔥 Error en API Flights:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}