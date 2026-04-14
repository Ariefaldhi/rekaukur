import { useState, useEffect } from 'react';
import { motion, useMotionValue, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Settings, Cog, ChevronRight, Play, Eye, Wrench } from 'lucide-react';
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

const ITEMS = [
  { name: 'Steel Piston', icon: 'cylinder' },
  { name: 'Hex Bolt', icon: 'bolt' },
  { name: 'Metal Spacer', icon: 'spacer' },
  { name: 'Valve Bearing', icon: 'bearing' }
];

function generateTarget() {
  return Math.floor(Math.random() * 401) + 100; // Between 1.00cm and 5.00cm
}

// ----------------------------------------------------------------------
// MAIN APP COMPONENT
// ----------------------------------------------------------------------
export default function App() {
  const [scene, setScene] = useState<1 | 2>(1); // 1: Story/Briefing, 2: Garage Workshop
  
  const [targetWidthPx, setTargetWidthPx] = useState(234);
  const [currentItem, setCurrentItem] = useState(ITEMS[0]);
  const [inputSU, setInputSU] = useState('');
  const [inputSN, setInputSN] = useState('');
  const [jawPosition, setJawPosition] = useState(800);
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    handleNextItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNextItem = () => {
    setTargetWidthPx(generateTarget());
    setCurrentItem(ITEMS[Math.floor(Math.random() * ITEMS.length)]);
    setJawPosition(800);
    setInputSU('');
    setInputSN('');
    setFeedback(null);
  };

  const handleVerify = () => {
    if (Math.abs(jawPosition - targetWidthPx) > 5) {
      setFeedback({ type: 'error', message: 'Rahang jangka sorong belum tertutup pas pada objek! Cek kembali jepitannya.' });
      return;
    }
    
    // Result = SU + (SN * 0.01) [in cm]
    const expectedSU = Math.floor(targetWidthPx / 10) / 10;
    const expectedSN = targetWidthPx % 10;
    
    const parsedSU = parseFloat(inputSU);
    const parsedSN = parseInt(inputSN, 10);
    
    if (parsedSU === expectedSU && parsedSN === expectedSN) {
      setFeedback({ type: 'success', message: 'Luar biasa! Pengukuranmu sangat presisi.' });
    } else {
      setFeedback({ type: 'error', message: 'Pembacaanmu kurang tepat. Periksa kembali garis Nonius yang paling lurus sejajar!' });
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-300 font-sans selection:bg-amber-500/30 overflow-hidden relative">
      
      {/* GARAGE AESTHETIC BACKGROUND */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-800 via-stone-900 to-black"></div>
      {/* Grunge/noise overlay simulation */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] mix-blend-overlay"></div>

      {/* HEADER GLOBALS */}
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20 pointer-events-none">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 border border-amber-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
               <Settings className="w-6 h-6 text-amber-500" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Asisten Bengkel</h1>
         </div>
      </header>

      {/* SCENE 1: BRIEFING */}
      <AnimatePresence>
        {scene === 1 && (
           <motion.div 
             exit={{ opacity: 0, y: -50 }}
             className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6"
           >
              <div className="max-w-3xl w-full bg-stone-900/90 border-2 border-stone-800 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-md relative overflow-hidden">
                 {/* Mechanic Decor */}
                 <Wrench className="absolute -right-10 -bottom-10 w-64 h-64 text-stone-800/30 opacity-50 -rotate-45" />
                 
                 <div className="relative z-10">
                    <span className="text-amber-500 font-bold uppercase tracking-widest text-sm mb-4 inline-block drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">Mekanik Senior</span>
                    <p className="text-3xl md:text-4xl font-light text-stone-100 leading-tight mb-8">
                       "Halo, aku butuh bantuanmu! Bengkel sedang sangat sibuk dan kita butuh suku cadang yang presisi. Gunakan Jangka Sorong ini untuk mendata komponen yang ada."
                    </p>
                    
                    <button 
                      onClick={() => setScene(2)}
                      className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                    >
                       Masuk ke Bengkel <Play className="w-5 h-5" fill="currentColor"/>
                    </button>
                 </div>
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* SCENE 2: THE WORKSHOP DASHBOARD */}
      {scene === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-10 flex flex-col p-6 pt-24 overflow-y-auto overflow-x-hidden">
           
           <div className="w-full max-w-[1200px] mx-auto flex-col flex gap-8">
              
              {/* TOP DASHBOARD METERS & GAUGES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 
                 {/* Current Item Display */}
                 <div className="bg-stone-900 border-2 border-stone-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-center">
                    <div className="text-xs text-stone-500 font-bold uppercase tracking-widest mb-1">Target Pengukuran</div>
                    <div className="text-2xl font-black text-white flex items-center gap-3">
                       <Cog className="text-amber-500 w-8 h-8"/> {currentItem.name}
                    </div>
                    {/* Glowing effect inside box */}
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none"></div>
                 </div>

                 {/* Mechanic Gauge / Stats (Stylistic) */}
                 <div className="bg-stone-900 border-2 border-stone-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
                    <div>
                       <div className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-1">Status Mesin</div>
                       <div className="text-lg font-bold text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">SISTEM NORMAL</div>
                    </div>
                    <div className="w-16 h-16 rounded-full border-[4px] border-emerald-900 flex items-center justify-center relative">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                           <circle cx="28" cy="28" r="26" stroke="transparent" strokeWidth="4" fill="none" />
                           <circle cx="28" cy="28" r="26" stroke="#34d399" strokeWidth="4" fill="none" strokeDasharray="163" strokeDashoffset={feedback?.type === 'success' ? "0" : "80"} className="transition-all duration-1000" />
                        </svg>
                        <span className="text-xs font-bold text-white">OK</span>
                    </div>
                 </div>

                 {/* Feedback Console */}
                 <div className={cn("border-2 rounded-2xl p-6 shadow-xl flex flex-col justify-center transition-colors", 
                    feedback?.type === 'success' ? "bg-emerald-950/40 border-emerald-900" : 
                    feedback?.type === 'error' ? "bg-red-950/40 border-red-900" : 
                    "bg-stone-900 border-stone-800")}>
                    <div className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mb-2">Log Asisten</div>
                    <div className={cn("text-sm font-semibold leading-relaxed", 
                       feedback?.type === 'success' ? "text-emerald-400" : 
                       feedback?.type === 'error' ? "text-red-400" : 
                       "text-stone-400"
                    )}>
                       {feedback ? feedback.message : 'Tunggu... Silakan jepit objek dengan Jangka Sorong.'}
                    </div>
                 </div>

              </div>

              {/* CALIPER WORKBENCH (Realistic Gradient Metals) */}
              <div className="w-full bg-gradient-to-b from-stone-800 to-stone-900 border-2 border-stone-700/50 rounded-[40px] shadow-2xl p-8 md:p-12 pb-24 relative flex justify-center items-center flex-col min-h-[450px] overflow-hidden">
                 
                 {/* Workshop Desk Texture */}
                 <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjxwYXRoIGQ9Ik0wIDBMOCA4Wk0wIDhMOCAwWiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')] opacity-10"></div>
                 {/* Workbench Lighting */}
                 <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-stone-500/20 rounded-full blur-[80px] pointer-events-none"></div>

                 {/* Dynamic Hover Magnifier Lens */}
                 <DynamicMagnifier jawPx={jawPosition} />

                 <div className="w-full relative mt-16 max-w-[1100px] flex justify-center hidden sm:flex">
                    <RealisticCaliper 
                       targetPx={targetWidthPx} 
                       jawPosition={jawPosition} 
                       setJawPosition={setJawPosition} 
                       isSuccess={feedback?.type === 'success'} 
                       itemType={currentItem.icon}
                    />
                 </div>
                 
                 <div className="sm:hidden w-full text-center p-6 bg-red-950 border border-red-900 rounded-xl text-red-200 shadow-lg relative z-10">
                    Silakan putar perangkat ke mode lanskap untuk dapat menjepit alat dengan leluasa.
                 </div>

              </div>

              {/* BOTTOM DATAPAD / CONTROLS */}
              <div className="bg-stone-900 border-t-4 border-t-amber-600 rounded-t-3xl rounded-b-3xl p-8 shadow-2xl relative">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-1 bg-stone-700 rounded-full"></div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-4">
                     
                     <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Input Skala Utama */}
                        <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 shadow-inner">
                           <label className="block text-xs font-bold text-amber-500 uppercase tracking-widest mb-3">Skala Utama (cm)</label>
                           <div className="relative">
                              <input 
                                 type="number" step="0.1" disabled={feedback?.type === 'success'}
                                 value={inputSU} onChange={e => setInputSU(e.target.value)}
                                 className="w-full bg-stone-900 border-2 border-stone-700 focus:border-amber-500 rounded-xl px-4 py-4 text-2xl font-mono text-white outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] disabled:opacity-50"
                                 placeholder="e.g. 2.3"
                              />
                              <span className="absolute right-5 top-5 text-stone-600 font-bold">cm</span>
                           </div>
                        </div>

                        {/* Input Skala Nonius */}
                        <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 shadow-inner">
                           <label className="block text-xs font-bold text-amber-500 uppercase tracking-widest mb-3">Skala Nonius</label>
                           <div className="relative">
                              <input 
                                 type="number" step="1" disabled={feedback?.type === 'success'}
                                 value={inputSN} onChange={e => setInputSN(e.target.value)}
                                 className="w-full bg-stone-900 border-2 border-stone-700 focus:border-amber-500 rounded-xl px-4 py-4 text-2xl font-mono text-white outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] disabled:opacity-50"
                                 placeholder="Garis (0-10)"
                              />
                           </div>
                        </div>
                     </div>

                     <div className="md:col-span-4 flex flex-col justify-end gap-4">
                        {feedback?.type === 'success' ? (
                           <button onClick={handleNextItem} className="w-full py-5 bg-stone-700 hover:bg-stone-600 text-amber-400 font-black uppercase tracking-widest rounded-xl transition-all shadow-lg border border-stone-600 flex items-center justify-center gap-2">
                             Ukur Benda Lain <ChevronRight className="w-5 h-5"/>
                           </button>
                        ) : (
                           <button 
                              disabled={!inputSU || !inputSN}
                              onClick={handleVerify} 
                              className="w-full py-5 bg-amber-600 hover:bg-amber-500 text-stone-950 focus:ring-4 focus:ring-amber-500/30 font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_0_25px_rgba(217,119,6,0.3)] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 relative overflow-hidden group"
                           >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                              <Eye className="w-5 h-5"/> Verifikasi Ukuran
                           </button>
                        )}
                        <p className="text-center text-xs text-stone-600 mt-2">Pastikan mata tegak lurus saat membaca.</p>
                     </div>

                  </div>
              </div>

           </div>
        </motion.div>
      )}

      {/* SUCCESS EFFECTS */}
      {feedback?.type === 'success' && <SuccessSparks />}

    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------

// A Magnifier that floats directly above the vernier overlapping position.
function DynamicMagnifier({ jawPx }: { jawPx: number }) {
  // Overlap math
  const overlapN = jawPx % 10;
  const overlapPxGlob = jawPx + (overlapN * 9); // distance from Main 0 in px
  
  // Center it on the overlap visually over the caliper track
  // Fixed left Jaw inner is at global X=100 in caliper space
  // Main scale 0 is at global X=150.
  const absoluteOverlapX = 150 + overlapPxGlob;
  
  // Magnifier window shifts inside
  const ZOOM = 3;
  const CENTER = 90; // for 180px wide circle
  
  const mainShiftX = CENTER - (overlapPxGlob * ZOOM);
  const vernierShiftX = CENTER - ((overlapN * 9) * ZOOM);

  return (
    <div 
       className="absolute z-40 hidden sm:flex pointer-events-none transition-all duration-[50ms]"
       // Align it right above the caliper beam. 
       // Note: absolute coordinate mapping involves CaliperWorkspace taking full width.
       // The absoluteOverlapX is relative to the CaliperWorkspace. 
       // We'll wrap the CaliperWorkspace in a relative container and position this absolutely over it.
       // Actually, we placed this component INSIDE the relative wrapper that contains the caliper.
       // CaliperWorkspace width is CALIPER_WIDTH_PX. We must position this based on absoluteOverlapX.
       style={{ left: `calc(50% - ${CALIPER_WIDTH_PX/2}px + ${absoluteOverlapX}px)`, top: '0px', transform: 'translateX(-50%)' }}
    >
       <div className="w-[180px] h-[180px] rounded-full border-[8px] border-stone-800 bg-stone-900 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(245,158,11,0.2)] overflow-hidden relative flex flex-col font-mono group">
          
          <div className="absolute top-2 w-full text-center z-50 text-[10px] font-bold text-amber-500 uppercase tracking-widest drop-shadow-[0_2px_2px_black]">Lens x3</div>

          <div className="w-full h-1/2 bg-gradient-to-b from-stone-400 to-stone-500 relative border-b-4 border-stone-900 shadow-inner">
             <div className="absolute bottom-0 left-0" style={{ transform: `translateX(${mainShiftX}px)` }}>
               {Array.from({ length: MAX_CM * 10 + 1 }).map((_, i) => (
                   <div key={i} className="absolute bottom-0 flex flex-col items-center" style={{ left: `${i * 10 * ZOOM}px`, transform: 'translateX(-50%)' }}>
                     <div className={cn("bg-stone-900 shadow-sm", i % 10 === 0 ? "h-[30px] w-[3px]" : i % 5 === 0 ? "h-[20px] w-[3px]" : "h-[12px] w-[2px]")} />
                     {i % 10 === 0 && <span className="absolute bottom-[35px] text-[20px] font-black text-stone-900">{i / 10}</span>}
                   </div>
               ))}
             </div>
          </div>
          
          <div className="w-full h-1/2 bg-gradient-to-b from-stone-300 to-stone-400 relative shadow-inner">
             <div className="absolute top-0 left-0" style={{ transform: `translateX(${vernierShiftX}px)` }}>
               {Array.from({ length: 11 }).map((_, i) => (
                   <div key={i} className="absolute top-0 flex flex-col items-center" style={{ left: `${i * 9 * ZOOM}px`, transform: 'translateX(-50%)' }}>
                     <div className={cn("rounded-b-sm shadow-sm", i % 5 === 0 ? "h-[25px]" : "h-[15px]", i === overlapN ? "w-[4px] bg-amber-600 shadow-[0_0_15px_#d97706]" : "w-[3px] bg-stone-800")} />
                     {i % 5 === 0 && <span className={cn("absolute top-[30px] text-[18px] font-black", i === overlapN ? "text-amber-700" : "text-stone-800")}>{i}</span>}
                   </div>
               ))}
             </div>
          </div>
          
          {/* Laser Guide */}
          <div className="absolute top-1/4 bottom-1/4 left-1/2 w-[2px] bg-amber-500/50 shadow-[0_0_8px_#f59e0b] -translate-x-1/2 z-30 opacity-80"></div>
          
          {/* Glass glare */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-full pointer-events-none"></div>
       </div>

       {/* Connector string to caliper below */}
       <div className="absolute top-[180px] left-1/2 w-0.5 h-[50px] bg-amber-500/30 -translate-x-1/2 shadow-[0_0_10px_#f59e0b]"></div>
    </div>
  );
}


function RealisticCaliper({ targetPx, jawPosition, setJawPosition, isSuccess, itemType }: { targetPx: number, jawPosition: number, setJawPosition: (v: number) => void, isSuccess: boolean, itemType: string }) {
  const x = useMotionValue(jawPosition);

  useEffect(() => { x.set(jawPosition); }, [jawPosition, x]);
  useMotionValueEvent(x, "change", (latest) => { setJawPosition(Math.round(latest)); });

  return (
    <div className="relative font-mono" style={{ width: CALIPER_WIDTH_PX, height: 300 }}>
      
      {/* 3D RANDOM WORKSHOP OBJECT */}
      <div 
         className="absolute z-0 shadow-[10px_20px_30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col justify-center items-center"
         style={{ 
            left: '100px', 
            top: '160px', 
            width: `${targetPx}px`, 
            height: itemType === 'spacer' ? '80px' : '50px',
            background: itemType === 'bolt' ? 'repeating-linear-gradient(90deg, #57534e, #292524 8px, #78716c 8px, #57534e 16px)' 
                      : itemType === 'cylinder' ? 'linear-gradient(to bottom, #78716c, #a8a29e, #292524)'
                      : itemType === 'bearing' ? 'radial-gradient(circle at center, #1c1917, #57534e 30%, #a8a29e 80%)'
                      : 'linear-gradient(45deg, #a8a29e, #78716c)',
            border: '2px solid #1c1917',
            borderRadius: itemType === 'spacer' ? '8px' : '2px',
         }}
      >
         {/* Metallic shine overlay */}
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent mix-blend-overlay"></div>
      </div>

      {/* METALLIC MAIN TRACK (Beam) */}
      <div className="absolute top-[100px] left-[80px] right-0 h-[60px] bg-gradient-to-b from-stone-400 via-stone-500 to-stone-600 z-10 flex border-y-[3px] border-stone-800 overflow-hidden shadow-[0_15px_15px_rgba(0,0,0,0.4)]">
         
         <div className="w-full h-[35px] bg-gradient-to-b from-stone-300 to-stone-400 relative border-b-2 border-stone-600 shadow-inner">
             <div className="absolute top-0 bottom-0 left-[70px]">
                {Array.from({ length: MAX_CM * 10 + 1 }).map((_, i) => (
                    <div key={i} className="absolute bottom-0 flex flex-col items-center" style={{ left: `${i * 10}px`, transform: 'translateX(-50%)' }}>
                       {i % 10 === 0 && <span className="absolute bottom-[20px] text-[12px] font-bold text-stone-900/90">{i/10}</span>}
                       <div className={cn("w-[2px] bg-stone-900", i%10===0 ? "h-4" : i%5===0 ? "h-3" : "h-2")} />
                    </div>
                ))}
             </div>
         </div>
         {/* Brushed metal texture overlay */}
         <div className="absolute inset-0 opacity-[0.15] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjMiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PC9zdmc+')] bg-repeat"></div>
      </div>

      {/* FIXED JAW (Left) */}
      <div className="absolute top-[100px] left-[40px] w-[60px] h-[180px] bg-gradient-to-r from-stone-500 to-stone-400 border-[3px] border-stone-800 rounded-l-3xl z-20 shadow-[10px_10px_20px_rgba(0,0,0,0.6)] overflow-hidden pt-4">
         <div className="absolute right-0 top-0 bottom-0 w-[6px] bg-stone-900 drop-shadow-xl"></div>
         <div className="absolute inset-0 bg-gradient-to-tr from-stone-800/20 to-transparent"></div>
      </div>

      {/* VERNIER SLIDE ASSEMBLY */}
      <motion.div 
        drag={!isSuccess ? "x" : false}
        dragConstraints={{ left: targetPx, right: MAX_CM * PIXELS_PER_CM }}
        dragElastic={0}
        dragMomentum={false}
        style={{ x }}
        className="absolute top-[90px] left-[100px] w-[200px] h-[190px] z-30 cursor-grab active:cursor-grabbing group"
      >
         {/* Sliding Jaw Solid Dropdown */}
         <div className="absolute top-[10px] left-0 w-[50px] h-[180px] bg-gradient-to-r from-stone-500 to-stone-400 border-[3px] border-stone-800 rounded-br-3xl shadow-[10px_10px_20px_rgba(0,0,0,0.6)] z-20 pb-4 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-amber-500 shadow-[0_0_15px_#f59e0b]"></div>
            
            {/* Grip */}
            <div className="absolute bottom-6 right-3 gap-1.5 flex flex-col w-6">
              <div className="h-1.5 bg-stone-800 w-full rounded shadow-sm"></div><div className="h-1.5 bg-stone-800 w-full rounded shadow-sm"></div><div className="h-1.5 bg-stone-800 w-full rounded shadow-sm"></div><div className="h-1.5 bg-stone-800 w-full rounded shadow-sm"></div>
            </div>
         </div>
         
         {/* Vernier Scale Display Window */}
         <div className="absolute top-[45px] left-[50px] w-[140px] h-[40px] bg-stone-300 border-[3px] border-stone-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] z-30 relative overflow-hidden">
             
             {/* Metallic bevel */}
             <div className="absolute top-[-3px] left-[-3px] right-[-3px] h-[6px] bg-stone-600 z-10 border-b border-stone-800"></div>

             <div className="absolute top-0 left-[10px]">
                {Array.from({ length: 11 }).map((_, i) => (
                    <div key={i} className="absolute top-0 flex flex-col items-center" style={{ left: `${i * 9}px`, transform: 'translateX(-50%)' }}>
                       <div className={cn("w-[2px] bg-stone-900", i%5===0 ? "h-4" : "h-2.5")} />
                       {i%5===0 && <span className="absolute top-[16px] text-[10px] font-black text-stone-900">{i}</span>}
                    </div>
                ))}
             </div>
             
             <div className="absolute bottom-[1px] right-[4px] text-[8px] font-black tracking-widest text-amber-700 uppercase">0.01 CM</div>
         </div>

         {/* Top Lock Screw Detail */}
         <div className="absolute top-[0px] left-[80px] w-10 h-[12px] bg-stone-400 border-[3px] border-stone-900 rounded-t-lg flex flex-col items-center overflow-hidden">
            <div className="w-full h-1 bg-stone-800 mb-0.5" />
            <div className="w-full h-1 bg-stone-800" />
         </div>
      </motion.div>
    </div>
  );
}

// SPARK PARTICLES
function SuccessSparks() {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
       {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
             key={i}
             className="absolute bg-amber-400 rounded-sm shadow-[0_0_15px_#f59e0b]"
             style={{
                width: Math.random() * 8 + 4,
                height: Math.random() * 8 + 4,
                left: '50%', top: '50%',
             }}
             initial={{ opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 }}
             animate={{ 
                opacity: [1, 1, 0],
                scale: [0, 1.5, 0],
                x: (Math.random() - 0.5) * 600,
                y: ((Math.random() - 0.5) * 600) + 100, // drops downwards like sparks
                rotate: Math.random() * 360
             }}
             transition={{ duration: 1 + Math.random(), ease: "easeOut" }}
          />
       ))}
    </div>
  );
}


