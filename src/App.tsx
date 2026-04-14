import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Settings, Play, Eye, Wrench, ChevronRight, RefreshCw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ----------------------------------------------------------------------
// CONSTANTS & GAME DATA
// ----------------------------------------------------------------------
const PIXELS_PER_CM = 100;
const MAX_CM = 10;
const CALIPER_WIDTH_PX = MAX_CM * PIXELS_PER_CM + 200; 

function generateTarget() {
  // Random width between 1.50cm (150px) and 4.00cm (400px)
  return Math.floor(Math.random() * 251) + 150; 
}

// ----------------------------------------------------------------------
// MAIN APP COMPONENT
// ----------------------------------------------------------------------
export default function App() {
  // GAME STATES definition:
  // 1 = Start Menu
  // 2 = Visual Novel Dialogue (Briefing)
  // 3 = The Workbench (Simulation)
  const [scene, setScene] = useState<1 | 2 | 3>(1);
  
  const [targetWidthPx, setTargetWidthPx] = useState(234);
  const [inputSU, setInputSU] = useState('');
  const [inputSN, setInputSN] = useState('');
  const [jawPosition, setJawPosition] = useState(800);
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [score, setScore] = useState(0);

  // Audio References
  const bgmRef = useRef<HTMLAudioElement>(null);
  const sfxBenarRef = useRef<HTMLAudioElement>(null);
  const sfxSalahRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    handleNextItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startGame = () => {
    if (bgmRef.current) {
        bgmRef.current.volume = 0.4;
        bgmRef.current.play().catch(e => console.log('Audio autoplay prevented:', e));
    }
    setScene(2);
  };

  const handleNextItem = () => {
    setTargetWidthPx(generateTarget());
    setJawPosition(800); // Reset position fully open
    setInputSU('');
    setInputSN('');
    setFeedback(null);
  };

  const handleVerify = () => {
    if (Math.abs(jawPosition - targetWidthPx) > 5) {
      if (sfxSalahRef.current) { sfxSalahRef.current.volume = 0.7; sfxSalahRef.current.currentTime = 0; sfxSalahRef.current.play().catch(()=>{}); }
      setFeedback({ type: 'error', message: 'Rahang jangka sorong belum tertutup pas menjepit benda! Cek kembali jepitannya.' });
      return;
    }
    
    // Result = SU + (SN * 0.01) [in cm]
    const expectedSU = Math.floor(targetWidthPx / 10) / 10;
    const expectedSN = targetWidthPx % 10;
    
    const parsedSU = parseFloat(inputSU);
    const parsedSN = parseInt(inputSN, 10);
    
    if (parsedSU === expectedSU && parsedSN === expectedSN) {
      if (sfxBenarRef.current) { sfxBenarRef.current.volume = 0.8; sfxBenarRef.current.currentTime = 0; sfxBenarRef.current.play().catch(()=>{}); }
      setFeedback({ type: 'success', message: 'Mesin Stabil! Pengukuran piston tepat sekali.' });
      setScore(s => s + 100);
    } else {
      if (sfxSalahRef.current) { sfxSalahRef.current.volume = 0.7; sfxSalahRef.current.currentTime = 0; sfxSalahRef.current.play().catch(()=>{}); }
      setFeedback({ type: 'error', message: 'Perhatikan garis yang lurus sempurna antara garis hitam (di atas) dengan garis di rahang bawah!' });
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-300 font-sans selection:bg-cyan-500/30 overflow-hidden relative">
      
      {/* GLOBAL AUDIO TAGS */}
      <audio ref={bgmRef} src="/assets/bgm-bengkel.mp3" loop />
      <audio ref={sfxBenarRef} src="/assets/sfx-benar.wav" />
      <audio ref={sfxSalahRef} src="/assets/sfx-salah.wav" />

      {/* BACKGROUND IMAGE INTEGRATION */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-stone-900/60 z-10 mix-blend-multiply pointer-events-none"></div>
         <img src="/assets/bg-bengkel.jpg" alt="Bengkel Background" className="w-full h-full object-cover opacity-60" onError={(e) => {
            // Fallback visualization if asset is completely missing
            (e.target as HTMLImageElement).style.display = 'none';
         }}/>
         {/* Cyberpunk Neon Glow Overlay */}
         <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_top,_transparent_50%,_rgba(0,0,0,0.8)_100%)] pointer-events-none"></div>
      </div>

      <header className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-30 pointer-events-none">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-950/80 border border-cyan-500/50 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] backdrop-blur-sm">
               <Wrench className="w-5 h-5 text-cyan-400" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-md hidden md:block">
               RekaUkur: Asisten Bengkel
            </h1>
         </div>
         {scene === 3 && (
            <div className="bg-stone-900/80 border border-stone-700 px-6 py-2 rounded-full shadow-lg backdrop-blur-md">
               <span className="text-xs font-bold text-stone-500 uppercase tracking-widest mr-2">SKOR:</span>
               <span className="text-xl font-black text-amber-500">{score}</span>
            </div>
         )}
      </header>

      {/* STATE 1: START MENU */}
      <AnimatePresence>
        {scene === 1 && (
           <motion.div 
             exit={{ opacity: 0, scale: 0.95 }}
             className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 backdrop-blur-sm bg-black/40"
           >
              <div className="text-center max-w-2xl mb-12">
                 <h1 className="text-6xl md:text-8xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600 drop-shadow-[0_0_30px_rgba(245,158,11,0.6)] uppercase">
                   REKAUKUR
                 </h1>
                 <p className="text-2xl font-bold tracking-[0.2em] text-cyan-400 uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">Asisten Bengkel</p>
                 <div className="w-16 h-1 bg-cyan-500 mx-auto mt-6 rounded-full shadow-[0_0_10px_#06b6d4]"></div>
              </div>

              <button 
                onClick={startGame}
                className="px-10 py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black uppercase tracking-widest text-lg rounded-2xl transition-all shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-95 flex items-center gap-3 border border-cyan-400/50"
              >
                 Mulai Shift <Play className="w-6 h-6" fill="currentColor"/>
              </button>
           </motion.div>
        )}
      </AnimatePresence>

      {/* STATE 2: VISUAL NOVEL DIALOGUE */}
      <AnimatePresence>
        {scene === 2 && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="absolute inset-0 z-20 pointer-events-none"
           >
              {/* Karakter Asset Bottom Left */}
              <motion.div 
                 initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                 className="absolute bottom-0 left-4 md:left-12 w-[300px] md:w-[450px] aspect-[3/4] z-10"
              >
                 <img src="/assets/karakter.png" alt="Mekanik Character" className="w-full h-full object-contain object-bottom drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] pointer-events-auto" onError={(e) => {
                    // Fallback to silhouette if image missing
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjMWUxYjRhIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjMwIiByPSIyMCIvPjxwYXRoIGQ9Ik0yMCAxMDBoNjBDNzUgNzUgMjUgNzUgMjAgMTAwIiBmaWxsPSIjM2IzZDU0Ii8+PC9zdmc+';
                 }}/>
              </motion.div>

              {/* Dialogue Box */}
              <motion.div 
                 initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                 className="absolute bottom-12 md:bottom-20 left-4 right-4 md:left-[450px] md:right-20 z-20 pointer-events-auto"
              >
                 <div className="bg-stone-900/95 border-l-4 border-cyan-500 rounded-2xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl relative">
                    <span className="absolute -top-4 left-6 bg-cyan-600 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)] border border-cyan-400">Kepala Mekanik</span>
                    <p className="text-xl md:text-3xl font-light text-stone-100 leading-relaxed md:leading-relaxed mt-2 min-h-[100px]">
                       <TypingText text="Aku butuh bantuanmu, Asisten! Piston penggerak utama rusak. Tolong ukur diameternya dengan sangat presisi agar kita bisa membuat replikanya." speed={40} />
                    </p>
                    <div className="flex justify-end mt-6">
                       <button 
                         onClick={() => setScene(3)}
                         className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-cyan-400 border border-stone-600 font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                       >
                          Laksanakan <ChevronRight className="w-5 h-5"/>
                       </button>
                    </div>
                 </div>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* STATE 3 & 4: THE WORKBENCH & EVALUATION */}
      <AnimatePresence>
      {scene === 3 && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 z-20 flex flex-col p-4 md:p-6 pt-20 h-full overflow-y-auto">
           
           <div className="w-full max-w-[1300px] mx-auto h-full flex flex-col xl:flex-row gap-6">
              
              {/* LEFT: WORKBENCH / CALIPER AREA */}
              <div className="flex-1 bg-stone-900/80 border-2 border-stone-800 rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-xl flex flex-col relative min-h-[500px]">
                 
                 {/* Shrink dialogue box feature in corner */}
                 <div className="absolute top-6 left-6 right-6 hidden md:flex items-center gap-3 bg-stone-950/80 p-3 rounded-2xl border border-stone-800 z-10 w-max shadow-xl pr-6">
                    <img src="/assets/karakter.png" alt="Mekanik" className="w-12 h-12 object-cover rounded-full bg-stone-800 border-2 border-cyan-700" onError={(e)=>(e.target as HTMLImageElement).src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjMWUxYjRhIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjMwIiByPSIyMCIvPjxwYXRoIGQ9Ik0yMCAxMDBoNjBDNzUgNzUgMjUgNzUgMjAgMTAwIiBmaWxsPSIjM2IzZDU0Ii8+PC9zdmc+'} />
                    <span className="text-sm font-medium text-stone-300 italic">"Gunakan rahang jangka sorong secara manual untuk menjepit Piston."</span>
                 </div>

                 {/* Workbench Lighting Glow */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none"></div>

                 {/* The Interactive Caliper */}
                 <div className="flex-1 flex justify-center items-center w-full min-h-[350px] relative overflow-hidden hidden sm:flex pt-12">
                     <DynamicMagnifier jawPx={jawPosition} />
                     <div className="mt-20">
                         <RealisticCaliper 
                           targetPx={targetWidthPx} 
                           jawPosition={jawPosition} 
                           setJawPosition={setJawPosition} 
                           isSuccess={feedback?.type === 'success'} 
                         />
                     </div>
                 </div>

                 {/* Mobile Warning */}
                 <div className="sm:hidden flex-1 flex items-center justify-center text-center p-6 bg-red-950/50 border border-red-900 rounded-xl text-red-200 mt-12">
                    Untuk menggunakan alat ukur presisi, harap putar mode ponsel menjadi lanskap atau gunakan perangkat dengan layar lebih lebar.
                 </div>

              </div>

              {/* RIGHT: CYBERPUNK INPUTS & EVALUATION (STATE 4 INTEGRATED) */}
              <div className="w-full xl:w-[450px] shrink-0 flex flex-col gap-6">
                 
                 <div className="bg-stone-900/80 border-t-4 border-t-cyan-500 border-x-2 border-b-2 border-x-stone-800 border-b-stone-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                       <Settings className="w-24 h-24 text-cyan-500 animate-[spin_10s_linear_infinite]" />
                    </div>

                    <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6">Panel Data Presisi</h2>
                    
                    <div className="space-y-6 relative z-10">
                       {/* SU Input */}
                       <div>
                           <label className="flex items-center gap-2 text-xs text-cyan-400 uppercase tracking-widest font-bold mb-3">
                              Skala Utama (cm) <div className="w-full border-t border-cyan-800/50"></div>
                           </label>
                           <div className="relative group">
                              <input 
                                type="number" step="0.1" disabled={feedback?.type === 'success'}
                                className="w-full bg-stone-950 border border-stone-700/80 rounded-xl px-5 py-4 text-2xl font-mono text-cyan-100 outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50 shadow-inner"
                                placeholder="Contoh: 2.3" value={inputSU} onChange={e => setInputSU(e.target.value)}
                              />
                              <span className="absolute right-5 top-5 text-stone-600 font-mono font-bold">cm</span>
                           </div>
                       </div>
                       
                       {/* SN Input */}
                       <div>
                           <label className="flex items-center gap-2 text-xs text-amber-500 uppercase tracking-widest font-bold mb-3">
                              Skala Nonius <div className="w-full border-t border-amber-800/50"></div>
                           </label>
                           <input 
                              type="number" step="1" disabled={feedback?.type === 'success'}
                              className="w-full bg-stone-950 border border-stone-700/80 rounded-xl px-5 py-4 text-2xl font-mono text-amber-100 outline-none focus:border-amber-500 focus:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50 shadow-inner"
                              placeholder="Garis ke (0-10)" value={inputSN} onChange={e => setInputSN(e.target.value)}
                           />
                       </div>

                       {/* Action & Feedback Area */}
                       <div className="pt-4 border-t border-stone-800 mt-2">
                          {feedback ? (
                             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={cn("p-5 rounded-2xl border flex flex-col items-center text-center gap-3 shadow-lg mb-6", feedback.type === 'success' ? "bg-emerald-950/40 border-emerald-500/50" : "bg-red-950/40 border-red-500/50")}>
                                <h3 className={cn("text-lg font-black uppercase tracking-widest flex items-center gap-2", feedback.type === 'success' ? "text-emerald-400" : "text-red-400")}>
                                  {feedback.type === 'success' ? 'MESIN STABIL!' : 'KALIBRASI GAGAL'}
                                </h3>
                                <p className={cn("text-sm font-semibold leading-relaxed", feedback.type === 'success' ? "text-emerald-100/80" : "text-red-100/80")}>{feedback.message}</p>
                             </motion.div>
                          ) : (
                            <div className="text-stone-500 text-xs italic mb-6 leading-relaxed bg-stone-950 p-4 rounded-xl">
                              Status: Menunggu input logaritma.
                            </div>
                          )}
                          
                          {feedback?.type === 'success' ? (
                             <button onClick={handleNextItem} className="w-full py-4 bg-stone-800 hover:bg-stone-700 text-cyan-400 border border-stone-600 font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 hover:border-cyan-500 group">
                                Ukur Target Berikutnya <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500"/>
                             </button>
                          ) : (
                             <button 
                                disabled={!inputSU || !inputSN}
                                onClick={handleVerify}
                                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group border border-cyan-400/50"
                             >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                <Eye className="w-5 h-5"/> Verifikasi Presisi
                             </button>
                          )}
                       </div>
                    </div>
                 </div>

              </div>

           </div>
           
           {feedback?.type === 'success' && <SuccessParticles />}

        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB COMPONENTS
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

// The Magnifier (Zoom Lens 2.5x) visually hovers over the caliper alignment point.
function DynamicMagnifier({ jawPx }: { jawPx: number }) {
  // Same logic, visually scaled.
  const overlapN = jawPx % 10;
  const overlapPxGlob = jawPx + (overlapN * 9); 
  const absoluteOverlapX = 150 + overlapPxGlob;
  
  const ZOOM = 2.5;
  const CENTER = 100; // 200px wide
  
  const mainShiftX = CENTER - (overlapPxGlob * ZOOM);
  const vernierShiftX = CENTER - ((overlapN * 9) * ZOOM);

  return (
    <div 
       className="absolute z-40 hidden sm:flex pointer-events-none transition-all duration-[50ms]"
       style={{ left: `calc(50% - ${CALIPER_WIDTH_PX/2}px + ${absoluteOverlapX}px)`, top: '20px', transform: 'translateX(-50%)' }}
    >
       <div className="w-[200px] h-[200px] rounded-full border-[6px] border-cyan-500/80 bg-stone-900 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(6,182,212,0.4)] overflow-hidden relative flex flex-col font-mono group backdrop-blur-xl">
          <div className="absolute top-2 w-full text-center z-50 text-[11px] font-black text-cyan-400 uppercase tracking-widest drop-shadow-[0_2px_4px_black]">Zoom 2.5x</div>

          <div className="w-full h-1/2 bg-stone-300 relative border-b-4 border-stone-800 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.1)]">
             <div className="absolute bottom-0 left-0" style={{ transform: `translateX(${mainShiftX}px)` }}>
               {Array.from({ length: MAX_CM * 10 + 1 }).map((_, i) => (
                   <div key={i} className="absolute bottom-0 flex flex-col items-center" style={{ left: `${i * 10 * ZOOM}px`, transform: 'translateX(-50%)' }}>
                     <div className={cn("bg-stone-800 shadow-sm rounded-t-[1px]", i % 10 === 0 ? "h-[30px] w-[3px]" : i % 5 === 0 ? "h-[20px] w-[3px]" : "h-[12px] w-[2px]")} />
                     {i % 10 === 0 && <span className="absolute bottom-[35px] text-[20px] font-black text-stone-900">{i / 10}</span>}
                   </div>
               ))}
             </div>
          </div>
          
          <div className="w-full h-1/2 bg-cyan-100 relative shadow-inner">
             <div className="absolute top-0 left-0" style={{ transform: `translateX(${vernierShiftX}px)` }}>
               {Array.from({ length: 11 }).map((_, i) => (
                   <div key={i} className="absolute top-0 flex flex-col items-center" style={{ left: `${i * 9 * ZOOM}px`, transform: 'translateX(-50%)' }}>
                     <div className={cn("rounded-b-[1px] shadow-sm", i % 5 === 0 ? "h-[25px]" : "h-[15px]", i === overlapN ? "w-[4px] bg-red-500 shadow-[0_0_15px_#ef4444]" : "w-[3px] bg-cyan-900")} />
                     {i % 5 === 0 && <span className={cn("absolute top-[30px] text-[18px] font-black", i === overlapN ? "text-red-600" : "text-cyan-900")}>{i}</span>}
                   </div>
               ))}
             </div>
          </div>
          
          {/* Laser Guide Red */}
          <div className="absolute top-[10%] bottom-[10%] left-1/2 w-[2px] bg-red-500/70 shadow-[0_0_10px_#ef4444] -translate-x-1/2 z-30 opacity-90 pointer-events-none"></div>
          
          {/* Glass glare */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,_rgba(255,255,255,0.2)_0%,_transparent_60%)] rounded-full pointer-events-none"></div>
       </div>

       {/* Connector string */}
       <div className="absolute top-[195px] left-1/2 w-0.5 h-[60px] bg-cyan-500/40 -translate-x-1/2 shadow-[0_0_10px_#06b6d4]"></div>
    </div>
  );
}


function RealisticCaliper({ targetPx, jawPosition, setJawPosition, isSuccess }: { targetPx: number, jawPosition: number, setJawPosition: (v: number) => void, isSuccess: boolean }) {
  const x = useMotionValue(jawPosition);

  useEffect(() => { x.set(jawPosition); }, [jawPosition, x]);
  useMotionValueEvent(x, "change", (latest) => { setJawPosition(Math.round(latest)); });

  return (
    <div className="relative font-mono" style={{ width: CALIPER_WIDTH_PX, height: 300 }}>
      
      {/* 2D SPRITE OBJECT INTEGRATION (benda-piston.png) */}
      <div 
         className="absolute z-0 flex flex-col justify-center items-center"
         style={{ 
            left: '100px', 
            top: '120px', 
            width: `${targetPx}px`, 
            height: '100px',
         }}
      >
         <img src="/assets/benda-piston.png" alt="Piston" className="w-full h-full object-fill drop-shadow-[15px_15px_10px_rgba(0,0,0,0.6)]" onError={(e) => {
             // Fallback box if image missing
             const target = e.target as HTMLImageElement;
             target.style.display = 'none';
             if (target.parentElement) {
                target.parentElement.style.background = 'linear-gradient(to bottom, #78716c, #a8a29e, #292524)';
                target.parentElement.style.border = '2px solid #1c1917';
                target.parentElement.style.borderRadius = '8px';
                target.parentElement.style.boxShadow = '10px 20px 30px rgba(0,0,0,0.8)';
             }
         }} />
      </div>

      {/* METALLIC MAIN TRACK */}
      <div className="absolute top-[100px] left-[80px] right-0 h-[60px] bg-gradient-to-b from-stone-400 via-stone-500 to-stone-600 z-10 flex border-y-[3px] border-stone-800 overflow-hidden shadow-[0_15px_15px_rgba(0,0,0,0.4)]">
         <div className="w-full h-[35px] bg-stone-200 relative border-b-2 border-stone-600 shadow-[inset_0_-2px_10px_rgba(0,0,0,0.1)]">
             <div className="absolute top-0 bottom-0 left-[70px]">
                {Array.from({ length: MAX_CM * 10 + 1 }).map((_, i) => (
                    <div key={i} className="absolute bottom-0 flex flex-col items-center" style={{ left: `${i * 10}px`, transform: 'translateX(-50%)' }}>
                       {i % 10 === 0 && <span className="absolute bottom-[20px] text-[12px] font-bold text-stone-900/90">{i/10}</span>}
                       <div className={cn("w-[2px] bg-stone-900", i%10===0 ? "h-4" : i%5===0 ? "h-3" : "h-2")} />
                    </div>
                ))}
             </div>
         </div>
      </div>

      {/* FIXED JAW */}
      <div className="absolute top-[100px] left-[40px] w-[60px] h-[180px] bg-gradient-to-r from-stone-500 to-stone-400 border-[3px] border-stone-800 rounded-l-3xl z-20 shadow-[10px_10px_20px_rgba(0,0,0,0.6)] overflow-hidden pt-4">
         <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 shadow-xl border-l border-stone-600"></div>
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.1),_transparent)] pointer-events-none"></div>
      </div>

      {/* DRAGGABLE VERNIER ASSEMBLY */}
      <motion.div 
        drag={!isSuccess ? "x" : false}
        dragConstraints={{ left: targetPx, right: MAX_CM * PIXELS_PER_CM }}
        dragElastic={0}
        dragMomentum={false}
        style={{ x }}
        className="absolute top-[90px] left-[100px] w-[200px] h-[190px] z-30 cursor-grab active:cursor-grabbing group"
      >
         {/* Sliding Jaw Body */}
         <div className="absolute top-[10px] left-0 w-[50px] h-[180px] bg-gradient-to-r from-stone-500 to-stone-400 border-[3px] border-stone-800 rounded-br-3xl shadow-[10px_10px_20px_rgba(0,0,0,0.6)] z-20 pb-4 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-cyan-500 shadow-[0_0_15px_#06b6d4]"></div>
            
            {/* Texture Grip */}
            <div className="absolute bottom-6 right-3 gap-1.5 flex flex-col w-6">
              {[...Array(5)].map((_, i)=><div key={i} className="h-1 bg-stone-700/80 w-full rounded shadow-inner border-b border-stone-800"></div>)}
            </div>
         </div>
         
         {/* Vernier scale box */}
         <div className="absolute top-[45px] left-[50px] w-[140px] h-[40px] bg-stone-100 border-[3px] border-stone-800 shadow-[inset_0_2px_15px_rgba(0,0,0,0.2)] z-30 relative overflow-hidden">
             
             <div className="absolute top-[-3px] left-[-3px] right-[-3px] h-[6px] bg-stone-500 z-10 border-b border-stone-800 shadow-md"></div>

             <div className="absolute top-0 left-[10px]">
                {Array.from({ length: 11 }).map((_, i) => (
                    <div key={i} className="absolute top-0 flex flex-col items-center" style={{ left: `${i * 9}px`, transform: 'translateX(-50%)' }}>
                       <div className={cn("w-[2px] bg-stone-900 border-r border-stone-500/30", i%5===0 ? "h-4" : "h-2.5")} />
                       {i%5===0 && <span className="absolute top-[16px] text-[10px] font-black text-stone-900">{i}</span>}
                    </div>
                ))}
             </div>
             
             <div className="absolute bottom-[2px] right-[4px] text-[8px] font-black tracking-widest text-cyan-800 uppercase">0.01 CM</div>
         </div>

         {/* Lock Screw detail at top */}
         <div className="absolute top-[0px] left-[80px] w-12 h-[12px] bg-zinc-400 border-[3px] border-zinc-900 rounded-t-lg flex flex-col items-center overflow-hidden">
            <div className="w-full flex justify-around"><div className="w-1 h-3 bg-zinc-800"></div><div className="w-1 h-3 bg-zinc-800"></div><div className="w-1 h-3 bg-zinc-800"></div></div>
         </div>
      </motion.div>
    </div>
  );
}

function SuccessParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
       {Array.from({ length: 60 }).map((_, i) => (
          <motion.div
             key={i}
             className="absolute bg-cyan-400 rounded-sm shadow-[0_0_15px_#22d3ee]"
             style={{
                width: Math.random() * 6 + 3,
                height: Math.random() * 30 + 10, // vertical lines for matrix feel
                left: '50%', top: '50%',
             }}
             initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
             animate={{ 
                opacity: [1, 1, 0],
                scale: [0, 1.5, 0],
                x: (Math.random() - 0.5) * 1000,
                y: ((Math.random() - 0.5) * 1000) - 200,
             }}
             transition={{ duration: 1 + Math.random() * 1.5, ease: "easeOut" }}
          />
       ))}
    </div>
  );
}

