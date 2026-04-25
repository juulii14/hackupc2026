"use client";
import React, { useState, useEffect } from 'react';
import { Plane, Clock, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { FlightResultData } from '@/types/flight';

interface FlightResultsProps {
  data: {
    destinos: Array<{ pais: string; ciudad: string }>;
    num_imagenes: number;
  };
}

export default function FlightResults({ data }: FlightResultsProps) {
  const [flights, setFlights] = useState<FlightResultData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlights = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Agafem la primera ciutat de la llista per buscar vols
        const destination = data.destinos[0].ciudad;
        
        // Simulem una data de viatge (per exemple, d'aquí a 2 mesos)
        const travelDate = "2024-09-15"; 

        const response = await fetch('/api/flights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cityCode: destination, // El teu backend rep la ciutat
            adults: 1,
            date: travelDate
          }),
        });

        if (!response.ok) throw new Error('No hem pogut trobar vols ara mateix');

        const result = await response.json();
        
        if (result.error) throw new Error(result.error);
        
        setFlights(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (data.destinos.length > 0) {
      fetchFlights();
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#0072ce]" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Buscant les millors ofertes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
        <AlertCircle size={20} />
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <p className="text-slate-500 italic">No s'han trobat vols directes per aquesta data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {flights.map((flight) => (
        <div key={flight.id} className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Airline Info */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <img 
              src={flight.airlineLogo} 
              alt={flight.airlineName}
              className="w-12 h-12 object-contain rounded-lg border border-slate-50 p-1"
            />
            <div>
              <h4 className="font-black text-slate-900 leading-none mb-1">{flight.airlineName}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Economy Class</p>
            </div>
          </div>

          {/* Route & Time */}
          <div className="flex items-center gap-8 text-center">
            <div>
              <p className="text-lg font-black text-slate-900">{new Date(flight.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{flight.origin}</p>
            </div>
            
            <div className="flex flex-col items-center gap-1 min-w-[100px]">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{flight.durationMinutes} min</span>
              <div className="w-full h-[2px] bg-slate-100 relative">
                <Plane size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#0072ce]" />
              </div>
              <span className="text-[10px] font-bold text-[#0072ce] uppercase">{flight.stops === 0 ? 'Directe' : `${flight.stops} escala`}</span>
            </div>

            <div>
              <p className="text-lg font-black text-slate-900">{new Date(flight.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{flight.destination}</p>
            </div>
          </div>

          {/* Price & Action */}
          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
            <div className="text-right">
              <p className="text-2xl font-black text-[#0072ce] tracking-tighter">{Math.round(flight.price)} €</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preu final</p>
            </div>
            
            <a 
              href={flight.bookingUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-[#0072ce] transition-all shadow-lg shadow-slate-200"
            >
              RESERVAR <ExternalLink size={14} />
            </a>
          </div>
        </div>
      ))}
      
      <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-4">
        Powered by Skyscanner Partners API
      </p>
    </div>
  );
}