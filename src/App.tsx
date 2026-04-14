import { useState, useEffect } from 'react';
import { motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { Target, CheckCircle, AlertTriangle, Play, ChevronRight, Eye } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ----------------------------------------------------------------------
// DATA & CONSTANTS
// ----------------------------------------------------------------------
const PIXELS_PER_CM = 100;
const MAX_CM = 10;
const CALIPER_WIDTH_PX = MAX_CM * PIXELS_PER_CM + 200; 

function generateTarget() {
  return Math.floor(Math.random() * 401) + 100; // Between 1.00cm and 5.00cm
}

// ----------------------------------------------------------------------
// MAIN APP
// ----------------------------------------------------------------------
export default function App() {
  const [scene, setScene] = useState<1 | 2 | 3>(1);
  
  const [targetWidthPx, setTargetWidthPx] = useState(234);
  const [inputSU, setInputSU] = useState('');
  const [inputSN, setInputSN] = useState('');
  const [jawPosition, setJawPosition] = useState(800);
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  useEffect(() => {
    setTargetWidthPx(generateTarget());
    setJawPosition(800);
  }, []);

  const handleVerify = () => {
    if (Math.abs(jawPosition - targetWidthPx) > 5) {
      setFeedback({ type: 'error', message: 'Sepertinya pembacaanmu kurang teliti, rahang belum tertutup pas pada objek!' });
      return;
    }
    
    const expectedSU = Math.floor(targetWidthPx / 10) / 10;
    const expectedSN = targetWidthPx % 10;
    
    const parsedSU = parseFloat(inputSU);
    const parsedSN = parseInt(inputSN, 10);
    
    if (parsedSU === expectedSU && parsedSN === expectedSN) {
      setFeedback({ type: 'success', message: 'Luar biasa! Mesin kembali stabil.' });
    } else {
      setFeedback({ type: 'error', message: 'Sepertinya pembacaanmu kurang teliti, coba cek garis nonius yang paling lurus!' });
    }
  };

  const handleNextTarget = () => {
    setTargetWidthPx(generateTarget());
    setJawPosition(800);
    setInputSU('');
    setInputSN('');
    setFeedback(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden relative">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.8)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none z-0"></div>
      
      {/* SCENE 1: Landing & Menu */}
      {scene === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900 z-10">
          <div className="text-center max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
              REKAUKUR
              <span className="block text-2xl md:text-3xl mt-2 tracking-widest text-amber-400 uppercase">Ekspedisi Presisi</span>
            </h1>
            <p className="text-slate-400 mb-10 text-lg">Misi perbaikan mesin waktu. Pelajari hakikat fisika dan kuasai seni pengukuran presisi tingkat tinggi.</p>
            
            <div className="flex gap-4 justify-center">
              <button onClick={() => setScene(2)} className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] active:scale-95 flex items-center gap-2">
                <Play className="w-5 h-5" /> Mulai Misi
              </button>
              <button className="px-8 py-4 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-cyan-400 font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95">
                Galeri Alat
              </button>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-cyan-900/20 to-transparent pointer-events-none"></div>
        </motion.div>
      )}

      {/* SCENE 2: Briefing Misi (Cerita) */}
      {scene === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center p-4 md:p-8 z-10">
          <div className="max-w-4xl w-full max-h-[80vh] min-h-[500px] bg-slate-800/80 backdrop-blur-xl border-t-2 border-cyan-500 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row shadow-[0_0_50px_rgba(6,182,212,0.15)] relative">
            <div className="w-full md:w-1/3 bg-slate-700 relative overflow-hidden flex items-end justify-center min-h-[250px] md:min-h-0">
               <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+')]"></div>
               {/* Mekanik "Visual Novel" Avatar */}
               <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-48 h-64 md:w-64 md:h-80 relative flex items-end justify-center">
                  <div className="w-full h-4/5 bg-slate-800 rounded-t-[100px] border-4 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)] flex flex-col items-center pt-8 md:pt-12">
                     <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-600 rounded-full border-4 border-amber-400 mb-4 pt-2 overflow-hidden flex justify-center shadow-lg">
                        <div className="w-12 h-6 md:w-16 md:h-8 bg-slate-800 rounded-b-xl opacity-50"></div>
                     </div>
                     <div className="w-24 h-3 md:w-32 md:h-4 bg-cyan-900/50 rounded-full"></div>
                  </div>
               </motion.div>
            </div>
            
            <div className="w-full md:w-2/3 p-8 md:p-12 flex flex-col justify-center relative">
               <span className="text-amber-400 font-black tracking-widest uppercase text-sm mb-2 shadow-amber-400 drop-shadow-md">Mekanik Senior</span>
               <div className="text-2xl md:text-3xl font-light leading-relaxed text-cyan-50 min-h-[120px]">
                <TypingText text="Aku sedang memperbaiki mesin ini, tapi aku kehilangan data presisinya. Bisakah kamu membantuku mengukurnya?" speed={35} />
               </div>
               
               <motion.button 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5 }}
                 onClick={() => setScene(3)}
                 className="mt-8 md:mt-12 px-6 py-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500 text-cyan-400 font-bold uppercase tracking-widest rounded-xl transition-all self-start flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
               >
                 Siap Membantu <ChevronRight className="w-5 h-5"/>
               </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* SCENE 3 & 4: Meja Kerja & Verifikasi */}
      {scene === 3 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 flex flex-col items-center justify-between p-4 md:p-8 z-10 overflow-y-auto">
          
          <header className="w-full max-w-6xl flex justify-between items-center mb-4 pt-4">
             <div className="flex items-center gap-4">
                <Target className="w-8 h-8 text-amber-400" />
                <div>
                   <h2 className="text-xl font-bold tracking-widest text-white uppercase">Meja Kerja</h2>
                   <p className="text-xs text-amber-400/80">Simulator Jangka Sorong (0.01cm)</p>
                </div>
             </div>
             {feedback?.type === 'success' && (
                <button onClick={handleNextTarget} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl text-sm font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all">Target Baru</button>
             )}
          </header>

          {/* MAIN SIMULATION AREA */}
          <div className="flex-1 w-full flex flex-col items-center justify-center relative min-h-[400px]">
             
             {/* Scene 4 Feature: Magnifier Lens (Dynamically follows overlap) */}
             <MagnifierLens jawPx={jawPosition} />

             {/* Scene 3 Feature: The Interactive Caliper */}
             <div className="relative mt-8 px-8 py-16 bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-3xl shadow-2xl flex items-center justify-center w-full max-w-[1100px] overflow-hidden hidden sm:flex">
                <CaliperWorkspace targetPx={targetWidthPx} jawPosition={jawPosition} setJawPosition={setJawPosition} isSuccess={feedback?.type === 'success'} />
             </div>
             <div className="sm:hidden text-center text-red-400 bg-red-950/50 p-4 rounded-xl border border-red-500 mt-12 max-w-[300px]">
                Silakan putar perangkat ke mode lanskap, atau gunakan layar yang lebih besar untuk simulator ini.
             </div>
             
          </div>

          {/* CONTROLS & FEEDBACK */}
          <div className="w-full max-w-4xl mt-8 mb-4 bg-slate-800/80 backdrop-blur-xl border border-slate-700 p-6 md:p-8 rounded-3xl shadow-2xl grid md:grid-cols-2 gap-8 z-10 shrink-0">
             
             <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="block text-xs text-cyan-400 uppercase tracking-widest font-bold mb-2">Skala Utama (cm)</label>
                       <div className="relative group">
                          <input 
                            type="number" step="0.1" disabled={feedback?.type === 'success'}
                            className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 text-lg font-mono text-white outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50"
                            placeholder="Contoh: 2.3" value={inputSU} onChange={e => setInputSU(e.target.value)}
                          />
                          <span className="absolute right-4 top-3.5 text-slate-500 font-mono">cm</span>
                       </div>
                   </div>
                   <div>
                       <label className="block text-xs text-cyan-400 uppercase tracking-widest font-bold mb-2">Skala Nonius</label>
                       <input 
                          type="number" step="1" disabled={feedback?.type === 'success'}
                          className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 text-lg font-mono text-white outline-none focus:border-amber-500 focus:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all disabled:opacity-50"
                          placeholder="0-10" value={inputSN} onChange={e => setInputSN(e.target.value)}
                       />
                   </div>
                </div>
             </div>

             <div className="flex flex-col justify-end">
                {feedback ? (
                   <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={cn("p-4 rounded-xl border flex items-start gap-4 shadow-lg mb-4", feedback.type === 'success' ? "bg-emerald-900/40 border-emerald-500/50 text-emerald-400" : "bg-red-900/40 border-red-500/50 text-red-400")}>
                      {feedback.type === 'success' ? <CheckCircle className="w-6 h-6 shrink-0" /> : <AlertTriangle className="w-6 h-6 shrink-0" />}
                      <p className="font-semibold leading-relaxed">{feedback.message}</p>
                   </motion.div>
                ) : (
                  <div className="text-slate-400 text-sm italic mb-4 leading-relaxed">
                    Masukan angka pada form di samping lalu klik tombol Verifikasi.
                  </div>
                )}
                
                <motion.button 
                  whileHover={feedback?.type !== 'success' ? { scale: 1.02 } : {}}
                  whileTap={feedback?.type !== 'success' ? { scale: 0.98 } : {}}
                  disabled={feedback?.type === 'success' || !inputSU || !inputSN}
                  onClick={handleVerify}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-900 font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.6)] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <Eye className="w-5 h-5"/> Verify
                </motion.button>
             </div>
             
          </div>

          {feedback?.type === 'success' && <Particles />}
          
        </motion.div>
      )}

    </div>
  );
}

// ----------------------------------------------------------------------
// COMPONENTS
// ----------------------------------------------------------------------

function TypingText({ text, speed = 40 }: { text: string, speed?: number }) {
  const [displayed, setDisplayed] = useState('');
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.substring(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  
  return <span>{displayed}</span>;
}

// SIMULATOR COMPONENT
function CaliperWorkspace({ targetPx, jawPosition, setJawPosition, isSuccess }: { targetPx: number, jawPosition: number, setJawPosition: (v: number) => void, isSuccess: boolean }) {
  const x = useMotionValue(jawPosition);

  useEffect(() => { x.set(jawPosition); }, [jawPosition, x]);
  useMotionValueEvent(x, "change", (latest) => { setJawPosition(Math.round(latest)); });

  return (
    <div className="relative font-mono" style={{ width: CALIPER_WIDTH_PX, height: 260 }}>
      {/* 3D Object (Cylinder/Gear) */}
      <div 
         className="absolute rounded-md border-2 border-slate-800 shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-0 bg-gradient-to-t from-slate-600 via-slate-400 to-slate-500 overflow-hidden flex flex-col justify-evenly py-1"
         style={{ left: '100px', top: '140px', width: `${targetPx}px`, height: '60px' }}
      >
         {Array.from({ length: 12 }).map((_, i) => <div key={i} className="w-full h-[2px] bg-black/40 shadow-sm" />)}
         <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 pointer-events-none"></div>
      </div>

      {/* Main Track (Beam) */}
      <div className="absolute top-[80px] left-[80px] right-0 h-[60px] bg-slate-700 z-10 flex border-y-2 border-slate-600 overflow-hidden drop-shadow-xl">
         <div className="w-full h-[35px] bg-slate-300 relative border-b-2 border-slate-500/80 shadow-inner">
             {/* Note: Main Scale 0 is at offset EXACTLY 70px from beam start. So absolute 150px. */}
             <div className="absolute top-0 bottom-0 left-[70px]">
                {Array.from({ length: MAX_CM * 10 + 1 }).map((_, i) => (
                    <div key={i} className="absolute bottom-0 flex flex-col items-center" style={{ left: `${i * 10}px`, transform: 'translateX(-50%)' }}>
                       {i % 10 === 0 && <span className="absolute bottom-[20px] text-[12px] font-bold text-slate-800/90">{i/10}</span>}
                       <div className={cn("w-[2px] bg-slate-800", i%10===0 ? "h-4" : i%5===0 ? "h-3" : "h-2")} />
                    </div>
                ))}
             </div>
         </div>
      </div>

      {/* Fixed Left Jaw */}
      <div className="absolute top-[80px] left-[60px] w-[40px] h-[160px] bg-slate-600 border-2 border-slate-500 rounded-l-2xl z-20 shadow-xl overflow-hidden pt-4">
         <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-slate-800/60 drop-shadow-lg"></div>
      </div>

      {/* Vernier Slide Assembly */}
      <motion.div 
        drag={!isSuccess ? "x" : false}
        dragConstraints={{ left: targetPx, right: MAX_CM * PIXELS_PER_CM }}
        dragElastic={0}
        dragMomentum={false}
        style={{ x }}
        // Absolute left shifts so sliding jaw connects at exact JawPx
        className="absolute top-[80px] left-[100px] w-[200px] h-[160px] z-30 cursor-grab active:cursor-grabbing"
      >
         {/* Sliding Jaw Face */}
         <div className="absolute top-0 left-0 w-[40px] h-full bg-cyan-950 border-2 border-cyan-800 rounded-br-3xl shadow-xl z-20 pb-4">
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-cyan-400 shadow-[0_0_10px_cyan]"></div>
            <div className="absolute bottom-6 right-2 gap-1 flex flex-col w-5">
              <div className="h-1 bg-cyan-700/80 w-full rounded"></div><div className="h-1 bg-cyan-700/80 w-full rounded"></div><div className="h-1 bg-cyan-700/80 w-full rounded"></div>
            </div>
         </div>
         
         {/* Vernier Window Cutout */}
         <div className="absolute top-[35px] left-[40px] w-[140px] h-[40px] bg-cyan-100 border-[3px] border-cyan-500/50 shadow-2xl z-30">
             {/* Vernier Scale Starts at local X=50 relative to X. Since window is at X=40, Vernier 0 is at left=10px */}
             <div className="absolute top-0 left-[10px]">
                {Array.from({ length: 11 }).map((_, i) => (
                    <div key={i} className="absolute top-0 flex flex-col items-center" style={{ left: `${i * 9}px`, transform: 'translateX(-50%)' }}>
                       <div className={cn("w-[2px] bg-cyan-900", i%5===0 ? "h-3" : "h-2")} />
                       {i%5===0 && <span className="absolute top-[12px] text-[10px] font-bold text-cyan-900">{i}</span>}
                    </div>
                ))}
             </div>
             
             {/* Accuracy Label */}
             <div className="absolute bottom-[2px] left-[10px] text-[8px] font-bold tracking-widest text-cyan-700/90 drop-shadow-sm uppercase">0.01 CM</div>
         </div>
      </motion.div>
    </div>
  );
}

// MAGNIFIER FEEDBACK LENS
function MagnifierLens({ jawPx }: { jawPx: number }) {
  const overlapN = jawPx % 10;
  const overlapPx = jawPx + (overlapN * 9);
  
  const ZOOM = 3;
  const CENTER = 112; 
  
  const mainShiftX = CENTER - (overlapPx * ZOOM);
  const vernierShiftX = CENTER - ((overlapN * 9) * ZOOM);

  return (
    <div className="sticky top-0 z-40 mb-[-40px] pt-4 hidden md:flex flex-col items-center pointer-events-none drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]">
       <div className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] bg-slate-900/50 px-4 py-1.5 rounded-full border border-cyan-500/20">
          Kaca Pembesar <Eye className="w-4 h-4"/>
       </div>
       <div className="w-[224px] h-[224px] rounded-full border-[6px] border-cyan-500 bg-slate-900/95 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.6)] overflow-hidden relative font-mono">
          
          <div className="w-full h-1/2 bg-slate-300 relative border-b-4 border-slate-900 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.2)]">
             <div className="absolute bottom-0 left-0" style={{ transform: `translateX(${mainShiftX}px)` }}>
               {Array.from({ length: MAX_CM * 10 + 1 }).map((_, i) => (
                   <div key={i} className="absolute bottom-0 flex flex-col items-center" style={{ left: `${i * 10 * ZOOM}px`, transform: 'translateX(-50%)' }}>
                     <div className={cn("bg-slate-800 rounded-t-sm", i % 10 === 0 ? "h-[35px] w-[3px]" : i % 5 === 0 ? "h-[25px] w-[3px]" : "h-[15px] w-[2px]")} />
                     {i % 10 === 0 && <span className="absolute bottom-[40px] text-[22px] font-extrabold text-slate-800">{i / 10}</span>}
                   </div>
               ))}
             </div>
          </div>
          
          <div className="w-full h-1/2 bg-cyan-100 relative shadow-[inset_0_10px_20px_rgba(0,0,0,0.1)]">
             <div className="absolute top-0 left-0" style={{ transform: `translateX(${vernierShiftX}px)` }}>
               {Array.from({ length: 11 }).map((_, i) => (
                   <div key={i} className="absolute top-0 flex flex-col items-center" style={{ left: `${i * 9 * ZOOM}px`, transform: 'translateX(-50%)' }}>
                     <div className={cn("rounded-b-sm", i % 5 === 0 ? "h-[30px]" : "h-[20px]", i === overlapN ? "w-[4px] bg-amber-500 shadow-[0_0_15px_#f59e0b]" : "w-[3px] bg-cyan-900")} />
                     {i % 5 === 0 && <span className={cn("absolute top-[35px] text-[20px] font-black", i === overlapN ? "text-amber-600" : "text-cyan-900")}>{i}</span>}
                   </div>
               ))}
             </div>
          </div>
          
          {/* Vertical Focus Line */}
          <div className="absolute top-1/4 bottom-1/4 left-1/2 w-[2px] bg-red-500/50 -translate-x-1/2 z-30"></div>
          
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.5)_100%)] pointer-events-none rounded-full"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none rounded-full"></div>
       </div>
    </div>
  );
}

// PARTICLES EFEK
function Particles() {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
       {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
             key={i}
             className="absolute bg-emerald-400 rounded-full shadow-[0_0_15px_#34d399]"
             style={{
                width: Math.random() * 8 + 4,
                height: Math.random() * 8 + 4,
                left: '50%', top: '50%',
             }}
             initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
             animate={{ 
                opacity: [1, 1, 0],
                scale: [0, 1.5, 0],
                x: (Math.random() - 0.5) * 800,
                y: ((Math.random() - 0.5) * 800) - 100,
             }}
             transition={{ duration: 1.5 + Math.random(), ease: "easeOut" }}
          />
       ))}
    </div>
  );
}

