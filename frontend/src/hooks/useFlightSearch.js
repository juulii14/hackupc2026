import { useState } from 'react';
import { skyscannerService } from '../lib/skyscanner';

export const useFlights = () => {
  const [loading, setLoading] = useState(false);
  const [flightResults, setFlightResults] = useState([]);

  const fetchAllFlights = async (destinos) => {
    setLoading(true);
    const resultsAccumulator = [];

    for (const item of destinos) {
      try {
        // A. Buscar IATA
        const iata = await skyscannerService.getIataCode(item.ciudad);
        if (!iata) continue;

        // B. Crear Sesión
        const session = await skyscannerService.createSession(iata);
        
        if (session.sessionToken) {
          // Esperar 1 seg para que el servidor procese antes del poll
          await new Promise(r => setTimeout(r, 1000));
          
          // C. Obtener Vuelos
          const data = await skyscannerService.pollResults(session.sessionToken);
          
          resultsAccumulator.push({
            ciudad: item.ciudad,
            pais: item.pais,
            itineraries: data.content?.results?.itineraries || {}
          });
        }
      } catch (err) {
        console.error(`Fallo en destino ${item.ciudad}:`, err);
      }
    }

    setFlightResults(resultsAccumulator);
    setLoading(false);
  };

  return { fetchAllFlights, flightResults, loading };
};