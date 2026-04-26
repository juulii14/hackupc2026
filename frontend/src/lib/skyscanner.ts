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

  // Usamos Object.entries para obtener [id, data] y evitar el error de key undefined
  const mappedFlights: FlightResultData[] = Object.entries(itineraries).flatMap(([itineraryId, it]: [string, any]): FlightResultData[] => {
    const legId = it.legIds[0];
    const leg = legs[legId];
    
    if (!leg) return [];

    const carrierId = leg.marketingCarrierIds?.[0];
    const carrier = carriers?.[carrierId];

    const originPlace = places[leg.originPlaceId]?.iata || 'BCN';
    const destPlace = places[leg.destinationPlaceId]?.iata || 'DEST';

    // CORRECCIÓN PRECIO: Skyscanner V3 usa amount como string o number según la versión
    // Intentamos obtener el precio de la primera opción de reserva
    const pricingOption = it.pricingOptions?.[0];
    const rawPrice = pricingOption?.price?.amount;
    
    // Si el precio es un número muy grande (ej: 54000), lo dividimos por 1000. 
    // Si ya viene formateado (ej: 54.00), lo dejamos.
    let finalPrice = Number(rawPrice);
    if (finalPrice > 10000) finalPrice = finalPrice / 1000;
    if (isNaN(finalPrice)) finalPrice = 0;

    return [{
      id: itineraryId, // Usamos la llave del objeto como ID único
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
      bookingUrl: pricingOption?.items?.[0]?.deepLink || '#'
    }];
  });

  return mappedFlights.sort((a, b) => a.price - b.price);
}

// ... resto del objeto skyscannerService (getIataCode, createFlightSearch, etc.) queda igual
export const skyscannerService = {
    // Asegúrate de incluir las funciones que ya teníamos
    async getIataCode(cityName: string) { /* ... */ return 'MAD'; }, 
    async createFlightSearch(params: any) {
        const [year, month, day] = params.date.split('-').map(Number);
        const body = {
          query: {
            market: 'ES', locale: 'es-ES', currency: 'EUR',
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
        const response = await fetch(`${BASE_URL}/flights/live/search/poll/${sessionToken}`, {
          method: 'POST',
          headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' }
        });
        if (!response.ok) return [];
        const data = await response.json();
        return parseFlightResults(data);
    }
};