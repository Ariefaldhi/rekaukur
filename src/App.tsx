import { useState, useEffect } from 'react';
import { motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { BatteryLow, BatteryFull, Crosshair, Wrench, RefreshCcw, ChevronRight, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ----------------------------------------------------------------------
// DATA & CONSTANTS
// ----------------------------------------------------------------------

const PIXELS_PER_CM = 100;
const MAX_CM = 6;
const CALIPER_WIDTH_PX = MAX_CM * PIXELS_PER_CM + 150; 
const VERNIER_DIVISIONS = 10;
const VERNIER_WIDTH_PX = (VERNIER_DIVISIONS - 1) * (PIXELS_PER_CM / 10); // 9mm = 90px

const OBJECTS = [
  { name: 'Poros Roda Gigi', color: 'bg-slate-400' },
  { name: 'Silinder Mesin', color: 'bg-amber-600' },
  { name: 'Injektor Plasma', color: 'bg-cyan-500' },
  { name: 'Kapasitor Fluks', color: 'bg-purple-500' },
  { name: 'Inti Kuantum', color: 'bg-emerald-400' },
];

// ----------------------------------------------------------------------
// MAIN APP COMPONENT
// ----------------------------------------------------------------------

export default function App() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result' | 'gameover' | 'victory'>('start');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [energy, setEnergy] = useState(3);
  
  // Gameplay specifics
  const [targetWidthCm, setTargetWidthCm] = useState(0);
  const [currentObjectName, setCurrentObjectName] = useState('');
  const [currentObjectColor, setCurrentObjectColor] = useState('');
  
  // We use standard React state for the snap-to-pixel coordinate, to drive UI cleanly
  const [jawPosition, setJawPosition] = useState(0); 

  // Readouts
  const [inputMain, setInputMain] = useState('');
  const [inputVernier, setInputVernier] = useState('');
  
  // Feedback
  const [feedback, setFeedback] = useState<{ type: 'success'|'error'|'info'; text: string } | null>(null);

  // Initialize a new level
  const initLevel = (lvl: number) => {
    // Generate between 1.00cm and 5.00cm with 0.01 precision
    const randomWidthCm = (Math.floor(Math.random() * 401) + 100) / 100;
    const randomObj = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
    
    setTargetWidthCm(randomWidthCm);
    setCurrentObjectName(randomObj.name);
    setCurrentObjectColor(randomObj.color);
    setLevel(lvl);
    setJawPosition(0); // reset caliper
    setInputMain('');
    setInputVernier('');
    setFeedback(null);
    setGameState('playing');
  };

  const handleStart = () => {
    setScore(0);
    setEnergy(3);
    initLevel(1);
  };

  const handleCraft = () => {
    // Check fit first
    const targetPx = Math.round(targetWidthCm * PIXELS_PER_CM);
    if (Math.abs(jawPosition - targetPx) > 2) {
      // The jaw isn't even touching the object correctly visually
      setFeedback({ type: 'error', text: 'Atur jangka sorong dengan hati-hati agar pas menempel pada komponen!' });
      return;
    }

    // Now validate their reading
    const expectedMain = Math.floor(targetWidthCm * 10) / 10; // e.g. 2.34 -> 2.3
    const expectedVernier = Math.round((targetWidthCm * 100) % 10); // e.g. 2.34 -> 4

    const parsedMain = parseFloat(inputMain);
    const parsedVernier = parseInt(inputVernier, 10);

    if (parsedMain === expectedMain && parsedVernier === expectedVernier) {
      // Success
      setScore(s => s + 100 * energy); // multiplier based on remaining energy
      setGameState('result');
      setFeedback({ type: 'success', text: 'Pengukuran Presisi! Suku cadang berhasil dikalibrasi.' });
    } else {
      // Wrong calculation
      setEnergy(e => e - 1);
      setFeedback({ type: 'error', text: `Pengukuran salah. PETUNJUK: Coba lihat di mana skala Nonius sejajar sempurna!` });
      if (energy - 1 <= 0) {
        setTimeout(() => setGameState('gameover'), 1500);
      }
    }
  };

  const handleNextLevel = () => {
    if (level >= 3) {
      setGameState('victory');
    } else {
      initLevel(level + 1);
    }
  };

  return (
    <div className="min-h-screen sci-fi-grid bg-slate-900 text-slate-100 flex flex-col items-center overflow-x-hidden p-4 md:p-8 font-sans selection:bg-cyan-500/30">
      
      {/* HEADER / HUD */}
      <header className="w-full max-w-5xl flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-950/50 border border-cyan-500/30 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center justify-center">
            <Wrench className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase">
              RekaUkur
            </h1>
            <p className="text-xs text-cyan-500/80 tracking-widest uppercase">Sistem Aktif</p>
          </div>
        </div>
        
        {gameState !== 'start' && (
          <div className="flex items-center gap-4 md:gap-8 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Level</span>
              <span className="font-mono text-lg font-semibold text-white">{level}<span className="text-slate-500">/3</span></span>
            </div>
            <div className="w-px h-8 bg-slate-700"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Skor</span>
              <span className="font-mono text-lg font-semibold text-amber-400">{score}</span>
            </div>
            <div className="w-px h-8 bg-slate-700"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Energi</span>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className={cn("w-3 h-4 rounded-sm border", i <= energy ? "bg-emerald-400 border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-slate-700 border-slate-600 block opacity-30")} />
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* GAME CONTENT */}
      <main className="w-full max-w-5xl flex-1 flex flex-col items-center justify-center relative">
        
        {/* START SCREEN */}
        {gameState === 'start' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl w-full text-center p-8 bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-700 shadow-2xl">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(6,182,212,0.4)]">
              <Crosshair className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-black mb-4">MISI PENGUKURAN</h2>
            <p className="text-slate-300 mb-8 leading-relaxed">
              Mekanik, generator mesin waktu rusak! Kita butuh suku cadang pengganti yang presisi. Gunakan Jangka Sorong untuk mengukur komponen yang rusak.<br/><br/>
              Sejajarkan rahang, baca Skala Utama, temukan garis yang sejajar pada Skala Nonius, dan masukkan ukuran yang presisi.
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold uppercase tracking-widest rounded-xl transition-colors shadow-[0_0_20px_rgba(6,182,212,0.5)]"
            >
              Mulai Misi
            </motion.button>
          </motion.div>
        )}

        {/* OVERLAY SCREENS */}
        {(gameState === 'result' || gameState === 'gameover' || gameState === 'victory') && (
          <div className="absolute inset-x-0 top-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-800/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-600 shadow-2xl max-w-md w-full text-center"
            >
              {gameState === 'result' && (
                <>
                  <div className="w-20 h-20 mx-auto bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4 border border-emerald-500/50">
                    <Check className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Komponen Selesai!</h3>
                  <p className="text-slate-300 mb-6">Presisi yang luar biasa. Komponen terpasang dengan sempurna.</p>
                  <button onClick={handleNextLevel} className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                    Level Selanjutnya <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              {gameState === 'gameover' && (
                <>
                  <div className="w-20 h-20 mx-auto bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4 border border-red-500/50">
                    <BatteryLow className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Sistem Offline</h3>
                  <p className="text-slate-300 mb-6">Terlalu banyak salah ukur. Kita kehabisan energi!</p>
                  <p className="mb-6 font-mono text-xl text-amber-400">Skor Akhir: {score}</p>
                  <button onClick={handleStart} className="w-full py-4 bg-slate-700 hover:bg-slate-600 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                    Mulai Ulang Simulasi <RefreshCcw className="w-5 h-5" />
                  </button>
                </>
              )}
              {gameState === 'victory' && (
                <>
                  <div className="w-20 h-20 mx-auto bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center mb-4 border border-cyan-500/50">
                    <BatteryFull className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Misi Berhasil!</h3>
                  <p className="text-slate-300 mb-6">Mesin waktu berhasil diperbaiki! Anda adalah master presisi.</p>
                  <p className="mb-8 font-mono text-3xl font-bold text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">Skor: {score}</p>
                  <button onClick={handleStart} className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                    Main Lagi
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}

        {/* ACTIVE GAMEPLAY */}
        {(gameState === 'playing' || gameState === 'result') && (
          <div className="w-full flex-col flex gap-8 items-center mt-12">
            
            {/* The Simulation Environment */}
            <div className="w-full overflow-x-auto pb-8 relative flex justify-center">
              
              {/* MAGNIFIER LENS */}
              <div className="absolute top-[-90px] left-1/2 -translate-x-1/2 z-20 pointer-events-none hidden md:flex flex-col items-center">
                <div className="text-xs text-cyan-400 font-mono tracking-widest mb-1 uppercase drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">Kaca Pembesar Digital</div>
                <div className="w-56 h-32 rounded-2xl border-2 border-cyan-500 bg-slate-900/90 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.3)] relative overflow-hidden flex items-center justify-center">
                  {/* Inner grid */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:100%_4px]"></div>
                  {/* Magnified Scale Viewer */}
                  <MagnifierView jawPosition={jawPosition} />
                  {/* Crosshair indicator */}
                  <div className="absolute inset-y-0 left-1/2 w-[1px] bg-red-500/50 z-30"></div>
                </div>
                <div className="w-[2px] h-8 bg-gradient-to-b from-cyan-500 to-transparent"></div>
              </div>

              {/* CALIPER WORKSPACE */}
              <div className="relative mt-12 bg-slate-800/40 p-12 rounded-3xl border border-slate-700 shadow-xl overflow-hidden backdrop-blur-sm" style={{ minWidth: `${CALIPER_WIDTH_PX + 200}px` }}>
                
                {/* Visual Object to measure */}
                <div 
                  className={cn("absolute bottom-[108px] left-[132px] h-12 border-2 border-white/20 rounded-sm flex items-center justify-center overflow-hidden shadow-inner", currentObjectColor)}
                  style={{ width: `${targetWidthCm * PIXELS_PER_CM}px` }}
                >
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+')] opacity-50"></div>
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest mix-blend-overlay rotate-180 transform">{currentObjectName}</span>
                </div>

                {/* --- CALIPERS COMPONENT --- */}
                <Caliper bodyWidthPx={CALIPER_WIDTH_PX} jawPosition={jawPosition} setJawPosition={setJawPosition} isActive={gameState === 'playing'} />

              </div>
            </div>

            {/* CONTROL PANEL */}
            <div className="w-full max-w-3xl bg-slate-800/80 p-6 md:p-8 rounded-3xl border border-slate-700 shadow-2xl backdrop-blur-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">Komponen Target</h3>
                    <div className="text-xl font-bold text-white flex items-center gap-2">
                       <div className={cn("w-3 h-3 rounded-full", currentObjectColor)}></div>
                       {currentObjectName}
                    </div>
                  </div>
                  
                  {/* KUNCI JAWABAN */}
                  <div className="p-3 bg-cyan-900/40 border border-cyan-500/50 rounded-xl">
                     <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-1">Kunci Jawaban</p>
                     <p className="text-sm text-cyan-100 font-mono">Skala Utama: {Math.floor(targetWidthCm * 10) / 10} cm</p>
                     <p className="text-sm text-cyan-100 font-mono">Skala Nonius: {Math.round((targetWidthCm * 100) % 10)}</p>
                  </div>
                  
                  {feedback && (
                    <div className={cn("p-4 rounded-xl border text-sm font-semibold flex items-start gap-3", 
                      feedback.type === 'error' ? "bg-red-500/10 border-red-500/30 text-red-400" :
                      "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    )}>
                      {feedback.type === 'error' ? <div className="mt-0.5"><Wrench className="w-4 h-4" /></div> : <Check className="w-4 h-4 mt-0.5" />}
                      <p>{feedback.text}</p>
                    </div>
                  )}
                  
                  {!feedback && (
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700 text-sm text-slate-400 flex items-start gap-3">
                      <div className="text-cyan-500 mt-0.5"><Crosshair className="w-4 h-4" /></div>
                      <p>Geser rahang transparan untuk mengapit komponen. Kemudian baca skala di mana garis sejajar sempurna.</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Bacaan Skala Utama</label>
                      <div className="relative group">
                        <input 
                          type="number" step="0.1"
                          disabled={gameState !== 'playing'}
                          className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 text-lg font-mono text-white outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50"
                          placeholder="e.g. 2.3"
                          value={inputMain} onChange={e => setInputMain(e.target.value)}
                        />
                        <span className="absolute right-4 top-3.5 text-slate-500 font-mono text-sm">cm</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Garis Skala Nonius</label>
                      <div className="relative">
                        <input 
                          type="number" min="0" max="10" step="1"
                          disabled={gameState !== 'playing'}
                          className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 text-lg font-mono text-white outline-none focus:border-amber-500 focus:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50"
                          placeholder="0-10"
                          value={inputVernier} onChange={e => setInputVernier(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <motion.button 
                    whileHover={gameState === 'playing' ? { scale: 1.02 } : {}} 
                    whileTap={gameState === 'playing' ? { scale: 0.98 } : {}}
                    disabled={gameState !== 'playing' || !inputMain || !inputVernier}
                    onClick={handleCraft}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-900 font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed mt-auto"
                  >
                    Buat Komponen
                  </motion.button>
                </div>
                
              </div>
            </div>
            
          </div>
        )}
      </main>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------

function Caliper({ bodyWidthPx, jawPosition, setJawPosition, isActive }: { bodyWidthPx: number, jawPosition: number, setJawPosition: (v: number) => void, isActive: boolean }) {
  
  const x = useMotionValue(jawPosition);

  // Sync prop changes (like reset) down to motion value
  useEffect(() => {
    x.set(jawPosition);
  }, [jawPosition, x]);

  // Sync drag changes up to React state
  useMotionValueEvent(x, "change", (latest) => {
    setJawPosition(Math.round(latest));
  });

  // Calculate constraints based on part width to allow "snapping" visually if needed, but here we just constrain to max width.
  const dragConstraints = { left: 0, right: MAX_CM * PIXELS_PER_CM };

  return (
    <div className="relative font-mono" style={{ width: bodyWidthPx, height: 160 }}>
      {/* 1. FIXED BEAM (Main Scale) */}
      <div className="absolute top-20 left-12 right-0 h-16 bg-slate-700 border-2 border-slate-600 rounded-r-lg shadow-md flex items-start overflow-hidden">
        {/* Metal texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-600 via-slate-500 to-slate-700 opacity-50"></div>
        
        {/* The Main Scale Render */}
        <div className="relative w-full h-[30px] border-b border-slate-800 bg-slate-300">
          <div className="absolute top-0 left-[120px] bottom-0 right-0"> {/* Offset where zero is */}
             {Array.from({ length: MAX_CM * 10 + 1 }).map((_, i) => {
               const px = i * (PIXELS_PER_CM / 10);
               const isCm = i % 10 === 0;
               const isHalf = i % 5 === 0 && !isCm;
               return (
                 <div key={i} className="absolute top-0 flex flex-col items-center" style={{ left: `${px}px`, transform: 'translateX(-50%)' }}>
                   <div className={cn("w-[1.5px] bg-slate-800", isCm ? "h-4" : isHalf ? "h-3" : "h-2")} />
                   {isCm && (
                     <span className="text-[10px] text-slate-800 font-bold mt-0.5 absolute top-4">{i / 10}</span>
                   )}
                 </div>
               );
             })}
          </div>
        </div>
      </div>

      {/* FIXED JAW (Left) */}
      <div className="absolute top-4 left-12 w-8 h-32 bg-slate-600 border-2 border-slate-500 rounded-l-xl shadow-lg drop-shadow-xl z-10 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-slate-400/30 before:to-transparent before:rounded-l-xl">
        <div className="absolute top-0 right-0 w-1 h-32 bg-slate-800 rounded-l-sm"></div>
      </div>

      {/* 2. MOVABLE JAW (Vernier Scale) */}
      <motion.div 
        drag={isActive ? "x" : false}
        dragConstraints={dragConstraints}
        dragElastic={0}
        dragMomentum={false}
        style={{ x }}
        className="absolute top-4 left-[80px] w-48 h-32 z-20 cursor-grab active:cursor-grabbing group"
      >
        {/* Movable left vertical piece */}
        <div className="absolute top-0 left-0 w-8 h-32 bg-cyan-900 border-2 border-cyan-700/80 rounded-r-xl shadow-xl backdrop-blur-md bg-opacity-90">
            <div className="absolute top-0 left-0 w-1 h-32 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
            {/* Grip ridges */}
            <div className="absolute bottom-4 right-2 w-4 flex flex-col gap-1">
               <div className="h-0.5 w-full bg-cyan-700"></div><div className="h-0.5 w-full bg-cyan-700"></div><div className="h-0.5 w-full bg-cyan-700"></div>
            </div>
        </div>

        {/* The sliding vernier frame block */}
        <div className="absolute top-16 left-8 right-0 h-20 bg-slate-800 border-[3px] border-cyan-800/80 rounded-br-lg shadow-2xl">
          {/* Vernier Window / Scale */}
          <div className="absolute top-0 left-0 w-full h-[32px] bg-cyan-100 border-b-2 border-cyan-900 overflow-hidden relative">
            <div className="absolute bottom-0 left-[36px] top-0">
               {Array.from({ length: VERNIER_DIVISIONS + 1 }).map((_, i) => {
                 const px = i * (VERNIER_WIDTH_PX / VERNIER_DIVISIONS);
                 const isMajor = i % 5 === 0;
                 return (
                   <div key={i} className="absolute bottom-0 flex flex-col items-center justify-end" style={{ left: `${px}px`, transform: 'translateX(-50%)' }}>
                     {isMajor && <span className="text-[9px] text-cyan-900 font-bold mb-[1px] absolute overflow-visible bottom-[6px]">{i}</span>}
                     <div className={cn("w-[1.5px] bg-cyan-900", isMajor ? "h-2.5" : "h-1.5")} />
                   </div>
                 );
               })}
            </div>
            {/* Gloss reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
          </div>
          
          <div className="absolute bottom-2 left-6 right-2 text-[8px] text-cyan-400 opacity-60 tracking-widest font-sans flex justify-between">
            <span>NONIUS x 0.01cm</span>
            <Crosshair className="w-3 h-3" />
          </div>
        </div>
        
        {/* Thumb screw visual */}
        <div className="absolute top-12 left-16 w-8 h-6 bg-slate-500 rounded-sm border-2 border-slate-700 grid grid-cols-3 gap-[1px] p-0.5 overflow-hidden">
          <div className="bg-slate-700 h-full w-full"></div><div className="bg-slate-700 h-full w-full"></div><div className="bg-slate-700 h-full w-full"></div>
        </div>

      </motion.div>
    </div>
  );
}

// ----------------------------------------------------------------------
// MAGNIFIER VIEW COMPONENT
// ----------------------------------------------------------------------
function MagnifierView({ jawPosition }: { jawPosition: number }) {
  // To draw the magnifier accurately, we recreate a zoomed portion of Main & Vernier.
  // The Vernier scale zero is literally at `jawPosition` relatively.
  // Let's compute which line perfectly aligns: 0 to 10
  const overlapIndex = jawPosition % 10;
  
  // Actually, to make it perfectly obvious visually, let's just render the scale at a high scale factor (e.g. 4x).
  const ZOOM = 3;
  
  // Center the view on the "overlap" point so the overlap is always in the middle of the lens.
  // Vernier zero is at px offset `jawPosition`.
  // The overlap point on the vernier scale happens at index `overlapIndex`, which is `overlapIndex * 9` px from the start of Vernier.
  // So the absolute position of the overlap on Main is `jawPosition + overlapIndex * 9`.
  const overlapVernierPx = overlapIndex * 9;
  
  // We offset the inner contents so `overlapVernierPx` on the vernier scale is centered exactly in our 224px wide container (112px).
  // So we translate the vernier container by: `112 - overlapVernierPx * ZOOM`.
  const vernierTranslateX = 112 - overlapVernierPx * ZOOM;
  
  // The main scale also needs to shift. The zero of the main scale relative to the zero of the vernier scale is `-jawPosition`.
  // So overlap on main scale is at `jawPosition + overlapVernierPx`. We want this to be at 112px in the view.
  const mainTranslateX = 112 - (jawPosition + overlapVernierPx) * ZOOM;
  
  return (
    <div className="relative w-full h-[80px] flex flex-col font-mono">
      {/* MAGNIFIED MAIN SCALE */}
      <div className="h-1/2 bg-slate-300 relative border-b-2 border-slate-800 shadow-inner">
        <div className="absolute top-0 bottom-0 left-0" style={{ transform: `translateX(${mainTranslateX}px)` }}>
          {Array.from({ length: MAX_CM * 10 + 1 }).map((_, i) => {
             const isCm = i % 10 === 0;
             const isHalf = i % 5 === 0 && !isCm;
             return (
               <div key={i} className="absolute top-0 flex flex-col items-center" style={{ left: `${i * 10 * ZOOM}px`, transform: 'translateX(-50%)' }}>
                 <div className={cn("bg-slate-800", isCm ? "h-6 w-[2px]" : isHalf ? "h-4 w-[2px]" : "h-2.5 w-[1.5px]")} />
                 {isCm && <span className="text-[14px] text-slate-800 font-bold mt-1 absolute top-6">{i / 10}</span>}
               </div>
             );
          })}
        </div>
      </div>
      
      {/* MAGNIFIED VERNIER SCALE */}
      <div className="h-1/2 bg-cyan-100 relative">
        <div className="absolute top-0 bottom-0 left-0" style={{ transform: `translateX(${vernierTranslateX}px)` }}>
          {Array.from({ length: VERNIER_DIVISIONS + 1 }).map((_, i) => {
             const px = i * 9; // 9 = VERNIER_WIDTH_PX / VERNIER_DIVISIONS
             const isMajor = i % 5 === 0;
             // Highlight overlap!
             const isOverlap = i === overlapIndex;
             
             return (
               <div key={i} className="absolute top-0 flex flex-col items-center" style={{ left: `${px * ZOOM}px`, transform: 'translateX(-50%)' }}>
                 <div className={cn("w-[2px]", isMajor ? "h-5" : "h-3", isOverlap ? "bg-red-500 shadow-[0_0_10px_red]" : "bg-cyan-900")} />
                 {isMajor && <span className={cn("text-[12px] font-bold mt-0.5 absolute top-5", isOverlap ? "text-red-600" : "text-cyan-900")}>{i}</span>}
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
}
