// services/skyscanner.ts

const API_KEY = process.env.SKYSCANNER_KEY || ''; 
const BASE_URL = 'https://partners.api.skyscanner.net/apiservices/v3';

// 1. Sacamos la función fuera. Al no exportarla, funciona como una función privada del módulo.
function parseFlightResults(data: any) {
  if (!data.content?.results) return [];

  const { itineraries, legs, carriers } = data.content.results;

  return Object.values(itineraries).map((it: any) => {
    const legId = it.legIds[0];
    const leg = legs[legId];
    const carrier = carriers[leg.marketingCarrierIds[0]];

    return {
      id: it.id,
      // Skyscanner suele devolver el precio como un entero. 
      // Si recibes 55000 para 55€, la división es / 1000.
      precio: it.pricingOptions[0]?.price?.amount / 1000, 
      aerolinea: carrier?.name,
      logo: carrier?.imageUrl,
      salida: leg.departureDateTime, 
      llegada: leg.arrivalDateTime,
      duracionMinutos: leg.durationInMinutes,
      escalas: leg.stopCount, 
      urlReserva: it.pricingOptions[0]?.items[0]?.deepLink
    };
  });
}

export const skyscannerService = {
  // Obtener código IATA
  async getIataCode(cityName: string): Promise<string | null> {
    const res = await fetch(`${BASE_URL}/autosuggest/flights`, {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: { searchTerm: cityName } })
    });
    const data = await res.json();
    return data.places?.[0]?.entityId || null; 
  },

  // PASO 1: Crear la sesión
  async createFlightSearch(params: {
    originCode: string,
    destCode: string,
    date: string, 
    adults: number
  }) {
    const [year, month, day] = params.date.split('-').map(Number);

    const body = {
      query: {
        market: 'ES',
        locale: 'es-ES',
        currency: 'EUR',
        query_legs: [{
          origin_place_id: { iata: params.originCode },
          destination_place_id: { iata: params.destCode },
          date: { year, month, day }
        }],
        adults: params.adults,
        cabin_class: 'CABIN_CLASS_ECONOMY'
      }
    };

    const response = await fetch(`${BASE_URL}/flights/live/search/create`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    return await response.json(); 
  },

  // PASO 2: Obtener resultados
  async getSearchUpdate(sessionToken: string) {
    const response = await fetch(`${BASE_URL}/flights/live/search/poll/${sessionToken}`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    // 2. Llamamos a la función directamente
    return parseFlightResults(data);
  }
};