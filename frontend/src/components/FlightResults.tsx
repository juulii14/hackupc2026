"use client";
import React, { useState, useEffect } from 'react';
import { Plane, ExternalLink, AlertCircle, Loader2, Info } from 'lucide-react';
import { FlightResultData } from '@/types/flight';

interface FlightResultsProps {
  originCode: string;
  destinationCity: string;
  adults: number;
  date: string;
}

export default function FlightResults({ originCode, destinationCity, adults, date }: FlightResultsProps) {
  const [flights, setFlights] = useState<FlightResultData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDuration = (totalMinutes: number) => {
    if (!totalMinutes) return "N/A";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  };

  useEffect(() => {
    let isMounted = true; 

    const fetchFlights = async () => {
      if (!destinationCity || !date || !originCode) return;
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/flights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cityCode: destinationCity, originCode, adults, date }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Error al buscar vuelos");

        if (isMounted) {
          setFlights(Array.isArray(result) ? result : (result.flights || []));
        }
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFlights();
    return () => { isMounted = false; }; 
  }, [destinationCity, originCode, adults, date]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-12 space-y-3">
      <Loader2 className="w-8 h-8 animate-spin text-[#0072ce]" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Searching for the best price...</p>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-xs font-bold">
      <AlertCircle className="inline mr-2" size={14} /> {error}
    </div>
  );

  if (flights.length === 0) return (
    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
      <Info className="mx-auto mb-2 text-slate-300" size={24} />
      <p className="text-slate-500 text-xs font-bold">There are no available flights for this date.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {flights.map((flight, index) => (
        <div 
          key={`${flight.id}-${index}`} // FIX: Key única garantizada
          className="group bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 w-full md:w-auto">
            <img src={flight.airlineLogo} alt={flight.airlineName} className="w-10 h-10 object-contain rounded-lg border p-1" />
            <div>
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-tight">{flight.airlineName}</h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{flight.origin} → {flight.destination}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-center grow justify-center">
            <div>
              <p className="text-sm font-black text-slate-900">{new Date(flight.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="flex flex-col items-center min-w-[80px]">
              <span className="text-[8px] font-black text-slate-400 uppercase">{formatDuration(flight.durationMinutes)}</span>
              <div className="w-full h-[1px] bg-slate-200 relative my-1">
                <Plane size={10} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#0072ce]" />
              </div>
              <span className="text-[8px] font-bold text-[#0072ce] uppercase">{flight.stops === 0 ? 'Direct' : `${flight.stops} Scale/s`}</span>
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">{new Date(flight.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between border-t md:border-t-0 pt-3 md:pt-0">
            <div className="text-right">
              <p className="text-lg font-black text-[#0072ce] tracking-tighter">{Math.round(flight.price)} €</p>
            </div>
            <a href={flight.bookingUrl} target="_blank" rel="noopener noreferrer" className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-[#0072ce] transition-all">
              BOOK NOW
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}