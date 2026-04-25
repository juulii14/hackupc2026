import Image from "next/image";
"use client";
import { useState, useRef, useEffect } from "react";
import { Camera, Plane, Loader2, Calendar, X, MapPin, Sparkles, Folder, Ticket, Coffee } from "lucide-react";
import FlightResults from '@/components/FlightResults';
import { RecepcionInfo } from '@/types/flight';

export default function Home() {
  const [files, setFiles] = useState<{ file: File; preview: string; rotation: number }[]>([]);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        rotation: Math.random() * 10 - 5 // Rotació aleatòria per a l'efecte scrapbook
      }));
      setFiles(prev => [...prev, ...newFiles].slice(0, 6));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const analyzePhotos = async () => {
    if (files.length === 0) return;
    setIsAnalyzing(true);
    setResult(null);

    // Simulació de crida
    setTimeout(async () => {
      try {
        const response = await fetch("http://localhost:8000/analyze", {
          method: "POST",
          body: new FormData(), // Hauries d'omplir-ho com el teu codi original
        });
        const data = await response.json();
        setResult(data);
      } catch (error) {
        setResult({ 
          destination: "Kyoto, Japan", 
          reason: "L'estètica minimalista i els tons naturals de les teves fotos encaixen perfectament amb la tardor japonesa.",
          activities: ["Temples", "Tea Ceremony", "Nature"]
        });
      } finally {
        setIsAnalyzing(false);
      }
    }, 2000);
  };

  return (
    <main className="min-h-screen graph-paper p-4 md:p-8 selection:bg-[#0072ce]/20">
      
      {/* HEADER / LOGO */}
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-[#0072ce] p-2.5 rounded-xl shadow-lg transform rotate-[-10deg] group-hover:rotate-[360deg] group-hover:scale-110 transition-all duration-700 ease-in-out">
            <Plane className="text-white w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 block leading-none">SkyLens</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0072ce]">by Skyscanner vibe</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-bold uppercase tracking-widest text-slate-400">
          <span className="hover:text-[#0072ce] cursor-pointer">Moodboard</span>
          <span className="hover:text-[#0072ce] cursor-pointer">Explore</span>
          <span className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">v.2.0</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* COLUMNA ESQUERRA: CONTROLS (ESTIL ID BADGE / FOLDER) */}
        <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
          
          {/* Month Selector (Com un tiquet o etiqueta) */}
          <div className="bg-white p-6 shadow-xl border-t-4 border-[#0072ce] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Calendar size={60} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Boarding Date</h3>
            <select 
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-lg p-3 font-bold text-slate-700 outline-none focus:border-[#0072ce] transition-colors"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>
                  {new Date(0, i).toLocaleString('ca', { month: 'long' }).toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Upload Button (Estil Carpeta) */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group cursor-pointer bg-[#fff9db] p-8 shadow-lg border-2 border-dashed border-yellow-400/50 relative transform hover:-rotate-1 transition-transform"
          >
            <Folder className="text-yellow-600 mb-4" size={32} />
            <h3 className="text-lg font-bold text-yellow-900 leading-tight">Drop your visual inspiration here.</h3>
            <p className="text-sm text-yellow-700/70 mt-2 italic">Outfit, architecture, colors...</p>
            <input type="file" multiple hidden ref={fileInputRef} onChange={handleFileChange} />
          </div>

          {/* Botó Analitzar (Estil Vinyl Record / Acció principal) */}
          <button 
            disabled={isAnalyzing || files.length === 0}
            onClick={analyzePhotos}
            className="w-full bg-slate-900 text-white p-6 rounded-2xl font-black text-xl shadow-2xl hover:bg-[#0072ce] transition-all flex items-center justify-center gap-4 disabled:opacity-50 group"
          >
            {isAnalyzing ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Sparkles size={20} className="group-hover:animate-pulse" />
                GENERATE DESTINATION
              </>
            )}
          </button>
        </div>

        {/* COLUMNA DRETA: MOODBOARD (ESTIL SCRAPBOOK) */}
        <div className="lg:col-span-8 order-1 lg:order-2 min-h-[500px] relative">
          
          <div className="absolute -top-10 -left-5 opacity-50 pointer-events-none hidden md:block">
             <span className="text-[120px] font-black text-slate-200/50 leading-none select-none italic">
                {new Date(0, month-1).toLocaleString('ca', { month: 'short' })}
             </span>
          </div>

          {files.length === 0 ? (
            <div className="h-full border-4 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center p-12 text-slate-300">
               <Camera size={48} className="mb-4 opacity-20" />
               <p className="font-bold uppercase tracking-widest text-center">Your canvas is empty</p>
            </div>
          ) : (
            <div className="relative w-full h-full min-h-[600px]">
              {files.map((f, i) => (
                <div 
                  key={i} 
                  className="polaroid absolute cursor-grab active:cursor-grabbing"
                  style={{ 
                    left: `${(i % 3) * 30 + 5}%`, 
                    top: `${Math.floor(i / 3) * 40 + 5}%`,
                    "--rotation": `${f.rotation}deg` 
                  } as any}
                >
                  <img src={f.preview} alt="mood" className="w-40 h-40 object-cover grayscale-[0.2] hover:grayscale-0 transition-all" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                  <div className="mt-4 h-4 w-24 bg-slate-100 rounded animate-pulse" />
                </div>
              ))}
              
              {/* Elements decoratius estil Yan Liu */}
              <div className="absolute bottom-10 right-10 transform rotate-12 opacity-80 hidden md:block pointer-events-none">
                 <Coffee className="text-slate-400" size={40} />
              </div>
            </div>
          )}

          {/* RESULT WINDOW (Estil Terminal / Ticket) */}
          {result && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-500">
              <div className="bg-[#1e1e1e] w-full max-w-lg rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10">
                <div className="bg-[#333] px-4 py-2 flex gap-1.5 items-center">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  <span className="text-[10px] text-slate-400 font-mono ml-2 uppercase tracking-widest">skylens-analyzer — zsh</span>
                </div>
                <div className="p-8 font-mono text-sm">
                  <p className="text-emerald-400 mb-2">~ $ whoami</p>
                  <p className="text-white mb-4 italic">Traveler with {files.length} visual matches found.</p>
                  <p className="text-emerald-400 mb-2">~ $ ls interests/</p>
                  <div className="flex flex-wrap gap-2 mb-6 text-blue-400">
                    {result.activities?.map((a: string) => <span key={a}>#{a}</span>)}
                  </div>
                  <div className="border-t border-white/10 pt-6">
                    <p className="text-[#0072ce] font-bold text-xs uppercase mb-2 tracking-[0.3em]">Destination Locked:</p>
                    <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">{result.destination}</h2>
                    <p className="text-slate-400 leading-relaxed italic leading-relaxed text-xs">
                       "{result.reason}"
                    </p>
                  </div>
                  <button 
                    onClick={() => setResult(null)}
                    className="mt-8 text-[10px] uppercase font-bold text-slate-500 hover:text-white transition-colors"
                  >
                    [ Close Terminal ]
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
export default function HomePage() {
  // Simulación de la info JSON que recibes
  const infoRecibida: RecepcionInfo = {
    num_imagenes: 3,
    destinos: [
      { pais: "Francia", ciudad: "Paris" },
      { pais: "Japón", ciudad: "Tokyo" }
    ]
  };

  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Planificador de Viajes</h1>
      <FlightResults data={infoRecibida} />
    </main>
  );
}
