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

  // Formateador de duración (minutos -> Xh Ymin)
  const formatDuration = (totalMinutes: number) => {
    if (!totalMinutes) return "N/A";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  };

  useEffect(() => {
    const fetchFlights = async () => {
      // Evitar llamadas innecesarias si faltan datos
      if (!destinationCity || !date || !originCode) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/flights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cityCode: destinationCity,
            originCode: originCode,
            adults: adults,
            date: date
          }),
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || "No se han podido encontrar vuelos.");
        }

        // Skyscanner a veces devuelve los datos envueltos de formas distintas
        if (Array.isArray(result)) {
          setFlights(result);
        } else if (result.flights && Array.isArray(result.flights)) {
          setFlights(result.flights);
        } else {
          setFlights([]);
        }

      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message);
        setFlights([]); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlights();
  }, [destinationCity, originCode, adults, date]);

  // 1. ESTADO: CARGANDO
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="relative">
          <Loader2 className="w-10 h-10 animate-spin text-[#0072ce]" />
          <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-[#0072ce]" />
        </div>
        <div className="text-center">
          <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Searching deals</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Connecting to Skyscanner Partners...</p>
        </div>
      </div>
    );
  }

  // 2. ESTADO: ERROR
  if (error) {
    return (
      <div className="flex items-start gap-4 p-5 bg-red-50 text-red-700 rounded-2xl border border-red-100 my-4">
        <AlertCircle className="shrink-0 mt-0.5" size={20} />
        <div>
          <p className="text-xs font-black uppercase tracking-tight">Search Error</p>
          <p className="text-sm font-medium opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  // 3. ESTADO: SIN RESULTADOS
  if (flights.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
        <Info className="mx-auto mb-3 text-slate-300" size={32} />
        <p className="text-slate-500 font-bold">No direct or cheap flights found.</p>
        <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">Try changing the date or origin city</p>
      </div>
    );
  }

  // 4. ESTADO: LISTADO DE VUELOS
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {flights.length} Results Found
        </span>
        <span className="text-[10px] font-black text-[#0072ce] uppercase tracking-widest bg-[#0072ce]/5 px-2 py-1 rounded">
          Best Prices First
        </span>
      </div>

      {flights.map((flight, index) => (
        <div 
          key={`${flight.id}-${index}`} // Fix: Key única combinada
          className="group bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-xl hover:border-[#0072ce]/20 transition-all duration-300 flex flex-col lg:flex-row items-center justify-between gap-8"
        >
          
          {/* Aerolínea */}
          <div className="flex items-center gap-4 w-full lg:w-1/4">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center p-2 border border-slate-100">
              <img 
                src={flight.airlineLogo || 'https://www.skyscanner.net/images/airline_logos/default.png'} 
                alt={flight.airlineName}
                className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all"
              />
            </div>
            <div>
              <h4 className="font-black text-slate-900 leading-none mb-1 text-sm uppercase tracking-tight">{flight.airlineName}</h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Standard Class</p>
            </div>
          </div>

          {/* Ruta y Horarios */}
          <div className="flex items-center justify-between w-full lg:w-2/4 px-4">
            <div className="text-left">
              <p className="text-xl font-black text-slate-900 tracking-tighter">
                {flight.departure ? new Date(flight.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </p>
              <p className="text-[10px] font-black text-slate-400 uppercase">{flight.origin}</p>
            </div>
            
            <div className="flex flex-col items-center grow px-8">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                {formatDuration(flight.durationMinutes)}
              </span>
              <div className="w-full h-[2px] bg-slate-100 relative rounded-full">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                  <Plane size={14} className="text-[#0072ce] rotate-90" />
                </div>
              </div>
              <span className={`text-[9px] font-black uppercase mt-2 ${flight.stops === 0 ? 'text-emerald-500' : 'text-orange-400'}`}>
                {flight.stops === 0 ? 'Direct Flight' : `${flight.stops} ${flight.stops === 1 ? 'Stop' : 'Stops'}`}
              </span>
            </div>

            <div className="text-right">
              <p className="text-xl font-black text-slate-900 tracking-tighter">
                {flight.arrival ? new Date(flight.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </p>
              <p className="text-[10px] font-black text-slate-400 uppercase">{flight.destination}</p>
            </div>
          </div>

          {/* Precio y CTA */}
          <div className="flex items-center gap-6 w-full lg:w-1/4 justify-between lg:justify-end border-t lg:border-t-0 pt-6 lg:pt-0">
            <div className="text-right">
              <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none">
                {flight.price > 0 ? `${Math.round(flight.price)} ${flight.currency === 'EUR' ? '€' : flight.currency}` : '---'}
              </p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Trip</p>
            </div>
            
            <a 
              href={flight.bookingUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group/btn flex items-center gap-2 bg-[#0072ce] text-white px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 hover:shadow-slate-200"
            >
              Select <ExternalLink size={12} className="group-hover/btn:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      ))}
      
      <div className="flex items-center justify-center gap-2 py-8 grayscale opacity-40">
        <div className="h-[1px] w-8 bg-slate-300"></div>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em]">
          End of results
        </p>
        <div className="h-[1px] w-8 bg-slate-300"></div>
      </div>
    </div>
  );
}