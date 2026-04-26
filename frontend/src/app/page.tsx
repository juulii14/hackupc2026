"use client";
import { useState, useRef } from "react";
import { Camera, Plane, Loader2, Calendar, X, MapPin, Sparkles, Folder, Ticket, Music } from "lucide-react";
import FlightResults from '@/components/FlightResults';

interface DestinoIA {
  city: string;
  country: string;
  reason: string;
  imageUrl: string;
}

export default function Home() {
  // ESTATS FITXERS I IA
  const [files, setFiles] = useState<{ file: File; preview: string; rotation: number }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DestinoIA[] | null>(null);
  const [openIndices, setOpenIndices] = useState<number[]>([]);

  // ESTATS TRIP DETAILS
  const [originCity, setOriginCity] = useState("");
  const [originIata, setOriginIata] = useState("");
  const [suggestions, setSuggestions] = useState<{name: string, code: string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [travelDate, setTravelDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);

  // ESTATS MÚSICA
  const [activeTab, setActiveTab] = useState<"photos" | "music">("photos");
  const [artist, setArtist] = useState("");
  const [track, setTrack] = useState("");
  const [isAnalyzingMusic, setIsAnalyzingMusic] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // AUTOSUGGEST CIUTATS
  const handleCitySearch = (query: string) => {
    setOriginCity(query);
    setOriginIata("");
    if (query.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    const cities = [
      { name: "Barcelona", code: "BCN" },
      { name: "Madrid", code: "MAD" },
      { name: "London", code: "LHR" },
      { name: "Paris", code: "CDG" },
      { name: "New York", code: "JFK" },
      { name: "Tokyo", code: "NRT" },
      { name: "Amsterdam", code: "AMS" },
      { name: "Rome", code: "FCO" },
      { name: "Lisbon", code: "LIS" },
      { name: "Berlin", code: "BER" },
      { name: "Dubai", code: "DXB" },
      { name: "Miami", code: "MIA" },
    ].filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
    setSuggestions(cities);
    setShowSuggestions(true);
  };

  const selectCity = (name: string, code: string) => {
    setOriginCity(name);
    setOriginIata(code);
    setShowSuggestions(false);
  };

  // GESTIÓ DEL CANVI DE DATA
  const handleDateChange = (dateValue: string) => {
    setTravelDate(dateValue);
    if (dateValue) {
      const selectedMonth = new Date(dateValue).getMonth() + 1;
      setMonth(selectedMonth);
    }
  };

  // GESTIÓ DE FOTOS
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const remaining = 6 - files.length;
      const newFiles = Array.from(e.target.files).slice(0, remaining).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        rotation: Math.random() * 10 - 5
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // CRIDA AL BACKEND PER ANALITZAR FOTOS
  const analyzePhotos = async () => {
    if (files.length === 0 || !travelDate || !originIata) return;
    setIsAnalyzing(true);
    setResult(null);
    setOpenIndices([]);

    const formData = new FormData();
    formData.append("month", month.toString());
    files.forEach(f => formData.append("images", f.file));

    try {
      const response = await fetch("http://localhost:8000/api/v1/recommendations", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Error API");
      const data = await response.json();
      const destinosConImagen = data.destinations
        .filter((dest: any) => dest.city.toLowerCase() !== originCity.toLowerCase())
        .map((dest: any, index: number) => ({
          ...dest,
          imageUrl: `https://picsum.photos/seed/${encodeURIComponent(dest.city)}/400/600`
        }));
      setResult(destinosConImagen);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 500);
    } catch (error) {
      alert("We didn't find this song :(.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // CRIDA AL BACKEND PER ANALITZAR MÚSICA
  const analyzeMusic = async () => {
    if (!artist || !track || !travelDate || !originIata) return;
    setIsAnalyzingMusic(true);
    setResult(null);
    setOpenIndices([]);

    try {
      const response = await fetch("http://localhost:8000/api/v1/recommendations/song", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artist, track }),
      });
      if (!response.ok) throw new Error("Error API");
      const data = await response.json();
      const destinosConImagen = data.destinations
 .filter((dest: any) => {
    const destCity = dest.city.toLowerCase().trim();
    const origin = originCity.toLowerCase().trim();
    return !destCity.includes(origin) && !origin.includes(destCity);
  })        .map((dest: any, index: number) => ({
          ...dest,
imageUrl: `https://picsum.photos/seed/${encodeURIComponent(dest.city)}/400/600`
        }));
      setResult(destinosConImagen);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 500);
    } catch (error) {
      alert("Error connectant amb la IA del backend.");
    } finally {
      setIsAnalyzingMusic(false);
    }
  };

  const scrollToFlight = (index: number) => {
    if (!openIndices.includes(index)) setOpenIndices([...openIndices, index]);
    setTimeout(() => {
      document.getElementById(`flights-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          <div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 block leading-none">VibeScanner</span>
            <span className="text-[10px] font-bold text-[#0072ce]">powered by SkyScanner</span>
          </div>
        </div>
      </nav>

<div className="max-w-6xl mx-auto space-y-8 mb-10">
  
  {/* FILA SUPERIOR: TRIP DETAILS + FORMULARI */}
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    
    {/* TRIP DETAILS */}
    <div className="lg:col-span-5">
      <div className="bg-white p-6 shadow-xl border-t-4 border-[#0072ce] space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Trip Details</h3>
        
        <div className="space-y-1 relative">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">From</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0072ce] w-4 h-4" />
            <input type="text" value={originCity} onChange={(e) => handleCitySearch(e.target.value)} placeholder="Enter departure city..." className="w-full pl-10 pr-3 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-[#0072ce] transition-all" />
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-[100] w-full mt-1 bg-white border border-slate-200 shadow-2xl rounded-xl overflow-hidden">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => selectCity(s.name, s.code)} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-blue-50 flex justify-between">
                  <span>{s.name}</span>
                  <span className="text-[10px] text-slate-300 font-mono">{s.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Departure Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0072ce] w-4 h-4" />
            <input type="date" value={travelDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => handleDateChange(e.target.value)} className="w-full pl-10 pr-3 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-[#0072ce]" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Travelers</label>
          <select value={adults} onChange={(e) => setAdults(Number(e.target.value))} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-[#0072ce]">
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>)}
          </select>
        </div>
      </div>
    </div>

    {/* PESTANYES + FORMULARI */}
    <div className="lg:col-span-7 space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setActiveTab("photos")} className={`flex-1 py-2 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === "photos" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"}`}>
          <Camera size={14} /> Photos
        </button>
        <button onClick={() => setActiveTab("music")} className={`flex-1 py-2 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === "music" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"}`}>
          <Music size={14} /> Music
        </button>
      </div>

      {activeTab === "photos" ? (
        <>
          <div onClick={() => files.length < 6 && fileInputRef.current?.click()} className={`group cursor-pointer bg-[#fff9db] p-8 shadow-lg border-2 border-dashed border-yellow-400/50 relative transform transition-all ${files.length >= 6 ? 'opacity-50' : 'hover:scale-[1.01]'}`}>
            <Folder className="text-yellow-600 mb-2" size={32} />
            <h3 className="text-lg font-bold text-yellow-900 leading-tight">Add your photos</h3>
            <p className="text-xs text-yellow-700 mt-2 italic">{files.length >= 6 ? "Moodboard full" : "Max 6 photos allowed"}</p>
            <input type="file" multiple hidden ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
          </div>
          <button disabled={isAnalyzing || files.length === 0 || !travelDate || !originIata} onClick={analyzePhotos} className="w-full bg-slate-900 text-white p-6 rounded-2xl font-black text-xl shadow-2xl hover:bg-[#0072ce] transition-all flex items-center justify-center gap-4 disabled:opacity-30">
            {isAnalyzing ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /> ANALYZE YOUR VIBE</>}
          </button>
        </>
      ) : (
        <>
          <div className="bg-white p-6 shadow-xl border-t-4 border-[#0072ce] space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Song Details</h3>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Artist</label>
              <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Ex: Bad Bunny" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-purple-500 transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Track</label>
              <input type="text" value={track} onChange={(e) => setTrack(e.target.value)} placeholder="Ex: Tití Me Preguntó" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:border-purple-500 transition-all" />
            </div>
          </div>
          <button disabled={isAnalyzingMusic || !artist || !track || !travelDate || !originIata} onClick={analyzeMusic} className="w-full bg-slate-900 text-white p-6 rounded-2xl font-black text-xl shadow-2xl hover:bg-purple-600 transition-all flex items-center justify-center gap-4 disabled:opacity-30">
            {isAnalyzingMusic ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /> ANALYZE VIBE</>}
          </button>
        </>
      )}
    </div>
  </div>

  {/* CANVAS A SOTA */}
{activeTab === "photos" && (
  <div className={`min-h-[500px] border-4 border-dashed border-slate-400 flex flex-col items-center justify-center p-12 text-slate-500 rounded-[40px] ${files.length > 0 ? 'border-none' : ''}`}>
    {files.length === 0 ? (
      <><Camera size={48} className="mb-4 text-slate-500" /><p className="font-bold uppercase tracking-widest text-center">Your canvas is waiting</p></>
    ) : (
      <div className="relative w-full h-full min-h-[500px]">
        {files.map((f, i) => (
          <div key={i} className="polaroid absolute group" style={{ left: `${(i % 3) * 25 + 5}%`, top: `${Math.floor(i / 3) * 35 + 5}%`, "--rotation": `${f.rotation}deg` } as any}>
            <img src={f.preview} alt="mood" className="w-40 h-40 object-cover grayscale-[0.2] hover:grayscale-0 transition-all" />
            <button onClick={() => removeFile(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
          </div>
        ))}
      </div>
    )}
  </div>
)}

</div>

      {/* POSTALS DE DESTINS */}
      {result && (
        <div ref={resultsRef} className="max-w-6xl mx-auto px-4 py-16 animate-in fade-in zoom-in">
          <div className="text-center mb-8">
<div className="text-center mb-8">
  <span className="inline-block text-2xl font-black text-[#0072ce] tracking-tight border-b-4 border-[#0072ce] pb-1">
    {activeTab === "music" ? "✦ Your music matches" : "✦ Your visual matches"}
  </span>
</div>
          </div>
          <div className="flex flex-row gap-8 overflow-x-auto pb-10 justify-center">
            {result.map((dest, idx) => (
              <div key={idx} className="relative min-w-[240px] w-[240px] h-[360px] group">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-8 bg-white/60 shadow-sm rotate-1 z-10" />
                <div className="relative h-full w-full bg-white border-[6px] border-white shadow-xl rounded-2xl overflow-hidden transition-all group-hover:-translate-y-4">
                  <div className="absolute inset-0 z-0">
                    <img src={dest.imageUrl} alt={dest.city} className="w-full h-full object-cover brightness-[0.85] group-hover:brightness-100 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                  </div>
                  <div className="absolute inset-0 z-10 p-6 flex flex-col justify-end text-white text-left">
                    <span className="text-[10px] font-black uppercase text-white/60">{dest.country}</span>
                    <h3 className="text-2xl font-black uppercase leading-tight">{dest.city}</h3>
                    <div className="max-h-0 group-hover:max-h-48 overflow-hidden transition-all duration-500">
                      <details className="mt-2">
                        <summary className="text-[10px] font-black uppercase tracking-widest text-white/60 cursor-pointer hover:text-white transition-colors">
                          Why this destination?
                        </summary>
                        <p className="text-[10px] text-white/70 italic mt-1">{dest.reason}</p>
                      </details>
                      <button onClick={() => scrollToFlight(idx)} className="mt-4 w-full py-2 bg-[#0072ce] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-[#0072ce] transition-colors shadow-lg">Check Flights</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACORDIONS DE VOLS */}
      <div className="max-w-4xl mx-auto pt-16 border-t border-slate-200 space-y-4 pb-32">
        {result && result.map((dest, idx) => {
          const isExpanded = openIndices.includes(idx);
          return (
            <div key={idx} id={`flights-${idx}`} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-4 transition-all">
              <button onClick={() => toggleAccordion(idx)} className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4 text-left">
                  <Ticket className="text-[#0072ce] w-5 h-5" />
                  <div>
                    <h3 className="font-black text-slate-900 uppercase">Flights to {dest.city}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{dest.country}</p>
                  </div>
                </div>
                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>▼</div>
              </button>
              {isExpanded && (
                <div className="p-6 pt-0 animate-in slide-in-from-top-2">
                  <FlightResults
                    originCode={originIata}
                    destinationCity={dest.city}
                    adults={adults}
                    date={travelDate}
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
