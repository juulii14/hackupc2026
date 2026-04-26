import { FlightResultData } from '@/types/flight';

const API_KEY = process.env.SKYSCANNER_KEY || ''; 
const BASE_URL = 'https://partners.api.skyscanner.net/apiservices/v3';

function formatSkyscannerDate(dateObj: any): string {
  if (!dateObj || !dateObj.year) return '';
  const date = new Date(
    dateObj.year, 
    dateObj.month - 1, 
    dateObj.day, 
    dateObj.hour || 0, 
    dateObj.minute || 0
  );
  return date.toISOString();
}

function parseFlightResults(data: any): FlightResultData[] {
  if (!data?.content?.results) return [];

  const { itineraries, legs, carriers, places, currencies } = data.content.results;
  const currencyCode = (Object.values(currencies || {})[0] as any)?.code || "EUR";

  if (!itineraries || Object.keys(itineraries).length === 0) return [];

  // Usamos flatMap: si devolvemos [objeto], lo añade al array; si devolvemos [], no añade nada.
  // Esto elimina la necesidad de filtrar nulos después.
  const mappedFlights: FlightResultData[] = Object.values(itineraries).flatMap((it: any): FlightResultData[] => {
    const legId = it.legIds[0];
    const leg = legs[legId];
    
    if (!leg) return []; // Si no hay trayecto, no devolvemos nada

    const carrierId = leg.marketingCarrierIds?.[0];
    const carrier = carriers?.[carrierId];

    const originPlace = places[leg.originPlaceId]?.iata || 'BCN';
    const destPlace = places[leg.destinationPlaceId]?.iata || 'DEST';

    const rawPrice = it.pricingOptions?.[0]?.price?.amount;
    const finalPrice = typeof rawPrice === 'number' ? rawPrice / 1000 : 0;

    // Retornamos un array con un solo objeto que cumpla estrictamente la interfaz
    return [{
      id: String(it.id),
      price: finalPrice,
      currency: String(currencyCode),
      origin: String(originPlace),
      destination: String(destPlace),
      departure: formatSkyscannerDate(leg.departureDateTime),
      arrival: formatSkyscannerDate(leg.arrivalDateTime),
      stops: Number(leg.stopCount || 0),
      airlineName: String(carrier?.name || 'Multiple Airlines'),
      airlineLogo: carrier?.imageUrl || 'https://www.skyscanner.net/images/airline_logos/default.png',
      durationMinutes: Number(leg.durationInMinutes || 0),
      bookingUrl: it.pricingOptions?.[0]?.items?.[0]?.deepLink || '#'
    }];
  });

  return mappedFlights.sort((a, b) => a.price - b.price);
}

export const skyscannerService = {
  async getIataCode(cityName: string): Promise<string | null> {
    try {
      const res = await fetch(`${BASE_URL}/autosuggest/flights`, {
        method: 'POST',
        headers: { 
          'x-api-key': API_KEY, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          query: { 
            searchTerm: cityName,
            market: 'ES',
            locale: 'es-ES'
          } 
        })
      });
      const data = await res.json();
      const place = data.places?.find((p: any) => p.iataCode);
      return place?.iataCode || data.places?.[0]?.entityId || null;
    } catch (error) {
      return null;
    }
  },

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
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return await response.json(); 
  },

  async getSearchUpdate(sessionToken: string): Promise<FlightResultData[]> {
    try {
      const response = await fetch(`${BASE_URL}/flights/live/search/poll/${sessionToken}`, {
        method: 'POST',
        headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return parseFlightResults(data);
    } catch (error) {
      return [];
    }
  }
};