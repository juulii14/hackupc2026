"use client";
import { useState, useRef } from "react";
import { Camera, Plane, Loader2, Calendar, X, MapPin, Sparkles, Folder, Coffee, Ticket } from "lucide-react";
import FlightResults from '@/components/FlightResults';
import { RecepcionInfo } from '@/types/flight';

// Adaptem el tipus segons el que ens retorna el nou endpoint
interface DestinoIA {
  ciudad: string;
  pais: string;
  rao: string;
}

export default function Home() {
  const [files, setFiles] = useState<{ file: File; preview: string; rotation: number }[]>([]);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DestinoIA[] | null>(null);
  const [flightData, setFlightData] = useState<RecepcionInfo | null>(null);
  
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
    if (files.length === 0) return;
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
      const destinosRecibidos = data.destination;
      const images = data.images.analyzed;

      setResult(destinosRecibidos);

      // Enviem la info al component de Skyscanner (FlightResults)
      const infoParaVuelos: RecepcionInfo = {
        num_imagenes: files.length,
        destinos: destinosRecibidos.map((d: DestinoIA) => ({
          pais: d.pais,
          ciudad: d.ciudad
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

          {/* TERMINAL DE RESULTATS MULTI-DESTINACIÓ */}
          {result && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-in zoom-in">
              <div className="bg-[#1e1e1e] w-full max-w-lg rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10">
                <div className="bg-[#333] px-4 py-2 flex gap-1.5 items-center">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" /><div className="w-3 h-3 rounded-full bg-[#ffbd2e]" /><div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  <span className="text-[10px] text-slate-400 font-mono ml-2 uppercase tracking-widest">skylens-analyzer — v1.0</span>
                </div>
                <div className="p-6 font-mono text-sm max-h-[420px] overflow-y-auto">
                  <p className="text-emerald-400 mb-4">~ $ get recommendations --month={month}</p>
                  
                  {result.map((dest, idx) => (
                    <div key={idx} className="mb-6 border-b border-white/5 pb-4 last:border-0">
                      <div className="text-blue-400 font-bold text-[10px] mb-1">MATCH #{idx + 1}</div>
                      <h2 className="text-2xl font-black text-white tracking-tighter uppercase">{dest.ciudad}, {dest.pais}</h2>
                      <p className="text-slate-400 italic text-xs mt-2 leading-relaxed">
                         "{dest.rao}"
                      </p>
                    </div>
                  ))}

                  <button onClick={() => setResult(null)} className="mt-4 text-[10px] uppercase font-bold text-slate-500 hover:text-white transition-colors">
                    [ Close results ]
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RESULTATS DE VOLS (INTEGRACIÓ SKyscanner) */}
      <div ref={resultsRef} className="max-w-7xl mx-auto pt-16 border-t border-slate-200">
        {flightData ? (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <Ticket className="text-[#0072ce]" /> Available Flights from Skyscanner
            </h2>
            <FlightResults data={flightData} />
          </div>
        ) : isAnalyzing && (
          <div className="py-20 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#0072ce]" />
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs animate-pulse">Consulting global travel database...</p>
          </div>
        )}
      </div>
    </main>
  );
}