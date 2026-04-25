const API_KEY = process.env.SKYSCANNER_KEY || ''; 
const BASE_URL = 'https://partners.api.skyscanner.net/apiservices/v3';

function formatSkyscannerDate(dateObj: any) {
  if (!dateObj) return null;
  return new Date(
    dateObj.year, 
    dateObj.month - 1, 
    dateObj.day, 
    dateObj.hour || 0, 
    dateObj.minute || 0
  ).toISOString();
}

function parseFlightResults(data: any) {
  if (!data?.content?.results) return [];

  const { itineraries, legs, carriers, places } = data.content.results;
  if (!itineraries) return [];

  return Object.values(itineraries).map((it: any) => {
    const legId = it.legIds[0];
    const leg = legs[legId];
    const carrierId = leg.marketingCarrierIds[0];
    const carrier = carriers[carrierId];

    const originPlace = places[leg.originPlaceId]?.iata || 'BCN';
    const destPlace = places[leg.destinationPlaceId]?.iata || 'DEST';

    return {
      id: `${it.id}-${legId}`, 
      price: it.pricingOptions[0]?.price?.amount / 1000, 
      airlineName: carrier?.name || 'Aerolínea',
      airlineLogo: carrier?.imageUrl || 'https://www.skyscanner.net/images/airline_logos/default.png',
      departure: formatSkyscannerDate(leg.departureDateTime), 
      arrival: formatSkyscannerDate(leg.arrivalDateTime),
      durationMinutes: leg.durationInMinutes,
      stops: leg.stopCount, 
      origin: originPlace,
      destination: destPlace,
      bookingUrl: it.pricingOptions[0]?.items[0]?.deepLink
    };
  });
}

export const skyscannerService = {
  async getIataCode(cityName: string): Promise<string | null> {
    try {
      const res = await fetch(`${BASE_URL}/autosuggest/flights`, {
        method: 'POST',
        headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: { searchTerm: cityName } })
      });
      const data = await res.json();
      const place = data.places?.[0];
      return place?.iataCode || place?.entityId || null;
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

  async getSearchUpdate(sessionToken: string) {
    const response = await fetch(`${BASE_URL}/flights/live/search/poll/${sessionToken}`, {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    return parseFlightResults(data);
  }
};