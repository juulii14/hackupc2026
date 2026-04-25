"use client";
import { useState, useRef } from "react";
import { Camera, Plane, Loader2, Calendar, X, MapPin, Sparkles, Folder, Coffee, Ticket } from "lucide-react";
import { FlightResults } from '@/components/FlightResults';
import { RecepcionInfo } from '@/types/flight';

// Adaptem el tipus segons el que ens retorna el nou endpoint
interface DestinoIA {
  city: string;
  country: string;
  reason: string;
}

export default function Home() {
  const [files, setFiles] = useState<{ file: File; preview: string; rotation: number }[]>([]);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DestinoIA[] | null>(null);
  const [flightData, setFlightData] = useState<RecepcionInfo | null>(null);
  const [openIndices, setOpenIndices] = useState<number[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        rotation: Math.random() * 10 - 5
      }));
      setFiles(prev => [...prev, ...newFiles].slice(0, 6));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // --- CRIDA A LA API ACTUALITZADA ---
  const analyzePhotos = async () => {
    /* if (files.length === 0) return;
    setIsAnalyzing(true);
    setResult(null);
    setFlightData(null);

    // Preparem el FormData segons les indicacions
    const formData = new FormData();
    formData.append("month", month.toString()); // El mes seleccionat a la UI
    
    // Si el backend espera 'images' (clau única per a múltiples fitxers o múltiple append)
    files.forEach(f => {
      formData.append("images", f.file); 
    });

    try {
      // Fem la crida a l'endpoint correcte
      const response = await fetch("http://localhost:8000/api/v1/recommendations", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error("Error en la resposta del servidor");

      const data = await response.json(); 
      
      // Suposem que el backend retorna { "recommendations": [...] } o directament l'array
      // Si la clau és diferent, canvia 'data.recommendations' per la que toqui
      const destinosRecibidos = data.destinations;
      const images = data.images_analyzed;

      setResult(destinosRecibidos);

      // Enviem la info al component de Skyscanner (FlightResults)
      const infoParaVuelos: RecepcionInfo = {
        num_imagenes: files.length,
        destinos: destinosRecibidos.map((d: DestinoIA) => ({
          pais: d.country,
          ciudad: d.city
        }))
      };

      setFlightData(infoParaVuelos);
      
      // Scroll suau cap avall per veure els resultats
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 800);

    } catch (error) {
      console.error("Error en la crida API:", error);
      alert("No s'ha pogut connectar amb el servidor de recomanacions.");
    } finally {
      setIsAnalyzing(false);
    } */

      if (files.length === 0) return;
  setIsAnalyzing(true);

  // 1. Simulem un temps d'espera (per veure les animacions de càrrega)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 2. Definim exactament el que retornaria el teu amic
  const mockData = {
    destinations: [
      {
        city: "Cancun",
        country: "Mexico",
        reason: "Les teves fotos tenen una vibra tropical i de platja perfecte per al gener."
      },
      {
        city: "Phuket",
        country: "Thailand",
        reason: "El clima càlid i les palmeres coincideixen amb la teva estètica visual."
      }
    ],
    images_analyzed: files.length
  };

  // 3. Posem les dades als estats com si haguessin vingut de la API
  setResult(mockData.destinations);
  setFlightData({
    num_imagenes: mockData.images_analyzed,
    destinos: mockData.destinations.map(d => ({ pais: d.country, ciudad: d.city }))
  });

  setIsAnalyzing(false);
  
  // Fem scroll cap avall
  setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 500);


  };

const scrollToFlight = (index: number) => {
  if (!openIndices.includes(index)) {
    setOpenIndices([...openIndices, index]); // Afegim el nou índex a la llista
  }
  
  setTimeout(() => {
    const element = document.getElementById(`flights-${index}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
};

const toggleAccordion = (index: number) => {
  if (openIndices.includes(index)) {
    // Si ja hi és, el treiem (tanquem)
    setOpenIndices(openIndices.filter(i => i !== index));
  } else {
    // Si no hi és, l'afegim (obrim)
    setOpenIndices([...openIndices, index]);
  }
};

  return (
    <main className="min-h-screen graph-paper p-4 md:p-8 selection:bg-[#0072ce]/20">
      
      {/* NAVBAR */}
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
          <div className="bg-[#0072ce] p-2.5 rounded-xl shadow-lg transform rotate-[-10deg] group-hover:rotate-[360deg] transition-all duration-700 ease-in-out">
            <Plane className="text-white w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 block leading-none">SkyLens</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0072ce]">by Skyscanner vibe</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
        
        {/* ESQUERRA: CONTROLS */}
        <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
          <div className="bg-white p-6 shadow-xl border-t-4 border-[#0072ce]">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Boarding Date</h3>
            <select 
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-lg p-3 font-bold text-slate-700 outline-none focus:border-[#0072ce]"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>
                  {new Date(0, i).toLocaleString('ca', { month: 'long' }).toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group cursor-pointer bg-[#fff9db] p-8 shadow-lg border-2 border-dashed border-yellow-400/50 relative transform hover:scale-[1.01] transition-transform"
          >
            <Folder className="text-yellow-600 mb-4" size={32} />
            <h3 className="text-lg font-bold text-yellow-900 leading-tight">Click to add your vibe photos.</h3>
            <p className="text-xs text-yellow-700 mt-2 italic">Max. 6 photos allowed</p>
            <input type="file" multiple hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
          </div>

          <button 
            disabled={isAnalyzing || files.length === 0}
            onClick={analyzePhotos}
            className="w-full bg-slate-900 text-white p-6 rounded-2xl font-black text-xl shadow-2xl hover:bg-[#0072ce] transition-all flex items-center justify-center gap-4 disabled:opacity-50 group"
          >
            {isAnalyzing ? (
              <Loader2 className="animate-spin" />
            ) : (
              <><Sparkles size={20} className="group-hover:rotate-12 transition-transform" /> ANALYZE MOOD</>
            )}
          </button>
        </div>

        {/* DRETA: MOODBOARD (SCRAPBOOK) */}
        <div className="lg:col-span-8 order-1 lg:order-2 min-h-[500px] relative">
          {files.length === 0 ? (
            <div className="h-full border-4 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center p-12 text-slate-300">
               <Camera size={48} className="mb-4 opacity-20" />
               <p className="font-bold uppercase tracking-widest text-center">Your canvas is waiting</p>
            </div>
          ) : (
            <div className="relative w-full h-full min-h-[500px]">
              {files.map((f, i) => (
                <div key={i} className="polaroid absolute group" style={{ left: `${(i % 3) * 25 + 5}%`, top: `${Math.floor(i / 3) * 35 + 5}%`, "--rotation": `${f.rotation}deg` } as any}>
                  <img src={f.preview} alt="mood" className="w-40 h-40 object-cover grayscale-[0.2] hover:grayscale-0 transition-all" />
                  <button onClick={() => removeFile(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                </div>
              ))}
              <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none hidden md:block">
                 <Coffee size={120} />
              </div>
            </div>
          )}
        </div>
        
      </div>

                {/* SECCIÓ DE RESULTATS: FILA HORITZONTAL DE POSTALS */}
{result && (
  <div className="mt-16 max-w-6xl mx-auto px-4 animate-in fade-in zoom-in duration-700">
    
    <div className="text-center mb-8">
       <span className="handwritten text-xl text-[#0072ce] -rotate-2 inline-block">Els teus "matches" visuals:</span>
    </div>

    {/* Contenidor de la fila horitzontal */}
    <div className="flex flex-row gap-6 overflow-x-auto pb-8 pt-4 custom-scrollbar snap-x justify-center">
      {result.map((dest, idx) => (
        <div 
          key={idx} 
          className="relative min-w-[280px] w-[280px] h-[400px] snap-center group"
        >
          {/* Cinta adhesiva decorativa */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-8 bg-white/60 backdrop-blur-sm z-30 shadow-sm rotate-1" />

          {/* Targeta estil Foxico-Mini */}
          <div className="relative h-full w-full bg-white border-[6px] border-white shadow-xl rounded-2xl overflow-hidden transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-1">
            
            {/* IMATGE (Amb fallback si no carrega) */}
            <div className="absolute inset-0 z-0">
              <img 
                src={`https://loremflickr.com/400/600/${dest.city.replace(/\s+/g, '')},travel/all`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt={dest.city}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=400&h=600";
                }}
              />
              {/* Gradient fosc per llegir text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            </div>

            {/* CONTINGUT */}
            <div className="absolute inset-0 z-10 p-6 flex flex-col justify-end text-white">
              <div className="mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{dest.country}</span>
                <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">{dest.city}</h3>
              </div>
              
              <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500">
                <p className="text-[10px] leading-tight text-white/80 mt-2 italic line-clamp-3">
                  "{dest.reason}"
                </p>
                <button 
      onClick={() => scrollToFlight(idx)} // <--- AQUESTA LÍNIA ÉS LA CLAU
      className="mt-4 w-full py-2 bg-[#0072ce] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-[#0072ce] transition-colors"
    >
      Check Flights
    </button>
              </div>
            </div>

            {/* Icona de l'avió petita */}
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30">
               <Plane className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{/* 3. FLIGHT RESULTS (Agrupats i col·lapsables) */}
<div className="max-w-4xl mx-auto pt-16 border-t border-slate-200 space-y-4">
{result && result.map((dest, idx) => {
  const isExpanded = openIndices.includes(idx); // Comprovem si aquest està obert

  return (
    <div key={idx} id={`flights-${idx}`} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-4">
      
      {/* CAPÇALERA */}
      <button 
        onClick={() => toggleAccordion(idx)} // Fem servir la nova funció de toggle
        className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 p-2 rounded-lg">
            <Ticket className="text-[#0072ce] w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="font-black text-slate-900 uppercase tracking-tight">Vols a {dest.city}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase">{dest.country}</p>
          </div>
        </div>
        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </button>

      {/* CONTINGUT */}
      {isExpanded && (
        <div className="p-6 pt-0 animate-in slide-in-from-top-2 duration-300">
          <FlightResults 
            data={{
              num_imagenes: files.length,
              destinos: [{ pais: dest.country, ciudad: dest.city }] 
            }} 
          />
        </div>
      )}
    </div>
  );
})}
</div>
    </main>
  );
}