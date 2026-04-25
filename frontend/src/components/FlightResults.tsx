'use client';

import { useState, useEffect } from 'react';
import { RecepcionInfo, FlightResult } from '@/types/flight';
import { skyscannerService } from '@/lib/skyscanner';

interface Props {
  data: RecepcionInfo;
}

export default function FlightResults({ data }: Props) {
  const [results, setResults] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllFlights = async () => {
      setLoading(true);
      const tempResults: FlightResult[] = [];

      for (const item of data.destinos) {
        try {
          const iata = await skyscannerService.getIataCode(item.ciudad);
          if (!iata) throw new Error("No se encontró código IATA");

          const session = await skyscannerService.createSession(iata);
          
          // Nota: El polling requiere un segundo POST al endpoint /poll/{token}
          // Aquí simulamos la recepción del primer precio disponible
          tempResults.push({
            ciudad: item.ciudad,
            precio: "Consultando..." // Aquí iría la lógica del poll
          });
        } catch (err) {
          tempResults.push({ ciudad: item.ciudad, error: "No disponible" });
        }
      }
      setResults(tempResults);
      setLoading(false);
    };

    if (data.destinos.length > 0) fetchAllFlights();
  }, [data]);

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">
        Vuelos para tus {data.num_imagenes} destinos
      </h2>
      
      {loading && <p className="animate-pulse">Buscando en Skyscanner...</p>}

      <div className="grid gap-4">
        {results.map((r, i) => (
          <div key={i} className="flex justify-between border-b py-2">
            <span className="font-medium">{r.ciudad}</span>
            <span className="text-blue-600">{r.precio || r.error}</span>
          </div>
        ))}
      </div>
    </div>
  );
}