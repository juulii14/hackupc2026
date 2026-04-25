"use client";
import { useState, useRef } from "react";
import { Camera, Plane, Loader2, Calendar, X, MapPin, Sparkles, Folder, Coffee, Ticket } from "lucide-react";
// L'ERROR ESTAVA AQUÍ: Treiem les claus { }
import FlightResults from '@/components/FlightResults';
import { RecepcionInfo } from '@/types/flight';

interface DestinoIA {
  city: string;
  country: string;
  reason: string;
  imageUrl: string; // Afegim imageUrl aquí
}

export default function Home() {
  const [files, setFiles] = useState<{ file: File; preview: string; rotation: number }[]>([]);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DestinoIA[] | null>(null);
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

  const analyzePhotos = async () => {
    if (files.length === 0) return;
    setIsAnalyzing(true);
    setResult(null);
    setOpenIndices([]);

    await new Promise(resolve => setTimeout(resolve, 2000));

    // MOCK DATA AMB IMATGES FIXES PERQUÈ NO BALLIN
    const mockData = {
      destinations: [
        {
          city: "Cancun",
          country: "Mexico",
          reason: "Vibra tropical i platja perfecte per al gener.",
          imageUrl: `https://loremflickr.com/400/600/cancun,landscape/all?lock=1`
        },
        {
          city: "Phuket",
          country: "Thailand",
          reason: "Clima càlid i palmeres que coincideixen amb el teu estil.",
          imageUrl: `https://loremflickr.com/400/600/phuket,landscape/all?lock=2`
        }
      ]
    };

    setResult(mockData.destinations);
    setIsAnalyzing(false);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 500);
  };

  const scrollToFlight = (index: number) => {
    if (!openIndices.includes(index)) {
      setOpenIndices([...openIndices, index]);
    }
    setTimeout(() => {
      const element = document.getElementById(`flights-${index}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const toggleAccordion = (index: number) => {
    if (openIndices.includes(index)) {
      setOpenIndices(openIndices.filter(i => i !== index));
    } else {
      setOpenIndices([...openIndices, index]);
    }
  };

  return (
    <main className="min-h-screen graph-paper p-4 md:p-8 selection:bg-[#0072ce]/20">
      
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
          <div className="bg-[#0072ce] p-2.5 rounded-xl shadow-lg transform rotate-[-10deg] group-hover:rotate-[360deg] transition-all duration-700">
            <Plane className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">SkyLens</span>
        </div>
      </nav>

      {/* GRID PRINCIPAL */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-10">
        <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
          <div className="bg-white p-6 shadow-xl border-t-4 border-[#0072ce]">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Boarding Date</h3>
            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="w-full bg-slate-50 border-2 border-slate-100 rounded-lg p-3 font-bold">
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('ca', { month: 'long' }).toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div onClick={() => fileInputRef.current?.click()} className="group cursor-pointer bg-[#fff9db] p-8 shadow-lg border-2 border-dashed border-yellow-400/50 transform hover:scale-[1.01] transition-transform">
            <Folder className="text-yellow-600 mb-4" size={32} />
            <h3 className="text-lg font-bold text-yellow-900 leading-tight">Click to add your vibe photos.</h3>
            <input type="file" multiple hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
          </div>

          <button disabled={isAnalyzing || files.length === 0} onClick={analyzePhotos} className="w-full bg-slate-900 text-white p-6 rounded-2xl font-black text-xl hover:bg-[#0072ce] transition-all">
            {isAnalyzing ? <Loader2 className="animate-spin" /> : "ANALYZE MOOD"}
          </button>
        </div>

        <div className="lg:col-span-8 order-1 lg:order-2 min-h-[450px] relative">
          {files.length === 0 ? (
            <div className="h-full border-4 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center p-12 text-slate-300 italic">
               Waiting for inspiration...
            </div>
          ) : (
            <div className="relative w-full h-full min-h-[450px]">
              {files.map((f, i) => (
                <div key={i} className="polaroid absolute group" style={{ left: `${(i % 3) * 25 + 5}%`, top: `${Math.floor(i / 3) * 35 + 5}%`, "--rotation": `${f.rotation}deg` } as any}>
                  <img src={f.preview} className="w-40 h-40 object-cover grayscale-[0.2] hover:grayscale-0 transition-all" />
                  <button onClick={() => removeFile(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"><X size={12} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* POSTALS (FILA HORITZONTAL CENTRADA) */}
      {result && (
        <div ref={resultsRef} className="max-w-6xl mx-auto px-4 py-16 animate-in fade-in zoom-in">
          <div className="flex flex-row gap-8 overflow-x-auto pb-10 justify-center">
            {result.map((dest, idx) => (
              <div key={idx} className="relative min-w-[260px] w-[260px] h-[380px] group">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-8 bg-white/60 shadow-sm rotate-1 z-10" />
                <div className="relative h-full w-full bg-white border-[6px] border-white shadow-xl rounded-2xl overflow-hidden transition-all group-hover:-translate-y-4">
                  <div className="absolute inset-0 z-0">
                    <img src={dest.imageUrl} className="w-full h-full object-cover brightness-[0.85] group-hover:brightness-100 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                  </div>
                  <div className="absolute inset-0 z-10 p-6 flex flex-col justify-end text-white">
                    <span className="text-[10px] font-black uppercase text-white/60">{dest.country}</span>
                    <h3 className="text-3xl font-black uppercase">{dest.city}</h3>
                    <div className="max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-500">
                      <p className="text-[10px] mt-3 italic line-clamp-4">"{dest.reason}"</p>
                      <button onClick={() => scrollToFlight(idx)} className="mt-4 w-full py-2 bg-[#0072ce] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-[#0072ce] transition-colors">Check Flights</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACORDIONS DE VOLS */}
      <div className="max-w-4xl mx-auto pt-16 border-t border-slate-200 space-y-4">
        {result && result.map((dest, idx) => {
          const isExpanded = openIndices.includes(idx);
          return (
            <div key={idx} id={`flights-${idx}`} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-4 transition-all">
              <button onClick={() => toggleAccordion(idx)} className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <Ticket className="text-[#0072ce] w-5 h-5" />
                  <div className="text-left">
                    <h3 className="font-black text-slate-900 uppercase">Vols a {dest.city}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{dest.country}</p>
                  </div>
                </div>
                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>▼</div>
              </button>
              {isExpanded && (
                <div className="p-6 pt-0 animate-in slide-in-from-top-2">
                  <FlightResults 
                    data={{ num_imagenes: files.length, destinos: [{ pais: dest.country, ciudad: dest.city }] }} 
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