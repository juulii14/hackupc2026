import { NextResponse } from 'next/server';
import { skyscannerService } from '@/lib/skyscanner';

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { cityCode, adults, date } = body;

    // 1. Lógica de Destinos (Barcelona BCN como Origen)
    let iata = cityCode;
    
    // Si no viene ciudad o hay error, buscamos Cancún (CUN) o Phuket (HKT)
    if (!cityCode || cityCode.length > 3) {
      const detected = await skyscannerService.getIataCode(cityCode);
      
      if (!detected) {
        // Si no detecta la ciudad, elegimos Cancún como fallback
        iata = 'CUN'; 
        console.log("⚠️ No se detectó IATA, usando Cancún (CUN) por defecto");
      } else {
        iata = detected;
      }
    }

    // Seguridad: Si intentamos buscar BCN a BCN, lo cambiamos a Phuket
    if (iata.toUpperCase() === 'BCN') {
      iata = 'HKT';
      console.log("🔄 Destino era Barcelona, cambiado a Phuket (HKT) para evitar conflicto");
    }

    console.log(`✈️ Buscando: BCN a ${iata} para el ${date}`);

    // 2. Crear sesión (Origen fijado en BCN)
    const sessionData = await skyscannerService.createFlightSearch({
      originCode: 'BCN', 
      destCode: iata,
      adults: adults || 1,
      date: date
    });

    const sessionToken = sessionData.sessionToken;

    if (!sessionToken) {
      return NextResponse.json({ error: "No session token", details: sessionData }, { status: 500 });
    }

    // 3. ESPERA DE SEGURIDAD
    await sleep(2000);

    // 4. Obtener resultados
    let flights = await skyscannerService.getSearchUpdate(sessionToken);

    // 5. Re-intento si sale vacío
    if (flights.length === 0) {
      await sleep(1500);
      flights = await skyscannerService.getSearchUpdate(sessionToken);
    }

    return NextResponse.json(flights);

  } catch (error: any) {
    console.error("🔥 Error crítico:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}