const API_KEY = process.env.NEXT_PUBLIC_SKYSCANNER_KEY || '';
const BASE_URL = 'https://partners.api.skyscanner.net/apiservices/v3';

export const skyscannerService = {
  async getIataCode(cityName: string): Promise<string | null> {
    const res = await fetch(`${BASE_URL}/autosuggest/flights`, {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: { searchTerm: cityName } })
    });
    const data = await res.json();
    return data.places?.[0]?.iataCode || null;
  },

  async createSession(iataCode: string) {
    const res = await fetch(`${BASE_URL}/flights/live/search/create`, {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: {
          market: 'ES',
          currency: 'EUR',
          locale: 'es-ES',
          query_legs: [{
            origin_place_id: { iata: 'MAD' }, // Madrid por defecto
            destination_place_id: { iata: iataCode },
            date: { year: 2026, month: 6, day: 15 }
          }],
          adults: 1
        }
      })
    });
    return res.json();
  }
};