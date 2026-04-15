import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Battery, BatteryFull, AlertTriangle, CheckCircle2, ChevronRight, Calculator, Gauge } from 'lucide-react';

const SCALE_PX_PER_CM = 100;
const MAIN_SCALE_LENGTH_CM = 6;

const playSound = (src: string) => {
    const audio = new Audio(src);
    audio.play().catch(() => {});
};

const MainScaleMarks = () => {
    return (
        <>
            {Array.from({ length: MAIN_SCALE_LENGTH_CM * 10 + 1 }).map((_, i) => {
                const isCm = i % 10 === 0;
                const isHalf = i % 5 === 0 && !isCm;
                return (
                    <div key={`main-${i}`} className="absolute bottom-0 flex flex-col items-center pointer-events-none" style={{ left: i * 10, width: 2, transform: 'translateX(-1px)' }}>
                        <div className={`bg-cyan-500 ${isCm ? 'h-[20px] bg-cyan-300' : isHalf ? 'h-[12px]' : 'h-[6px]'}`} style={{ width: '100%' }} />
                        {isCm && <span className="absolute bottom-[22px] text-[10px] text-cyan-300 font-mono">{i / 10}</span>}
                    </div>
                );
            })}
        </>
    );
};

const VernierScaleMarks = () => {
    return (
        <>
            {Array.from({ length: 11 }).map((_, i) => {
                const isCm = i % 10 === 0;
                const isHalf = i % 5 === 0 && !isCm;
                return (
                    <div key={`vernier-${i}`} className="absolute top-0 flex flex-col items-center pointer-events-none" style={{ left: i * 9, width: 2, transform: 'translateX(-1px)' }}>
                        <div className={`bg-amber-400 border-x border-amber-500 rounded-b ${isCm ? 'h-[15px]' : isHalf ? 'h-[10px]' : 'h-[6px]'}`} style={{ width: '100%' }} />
                        {i % 2 === 0 && <span className="absolute top-[16px] text-[9px] text-amber-200 font-mono">{i}</span>}
                    </div>
                );
            })}
        </>
    );
};

const CaliperRender = ({ jawX, objectWidth = 0, isLens = false }: any) => {
    return (
        <div className="relative w-[800px] h-[300px] pointer-events-none">
            {/* BEAM (Stationary) */}
            <div className="absolute left-[100px] top-[150px] w-[650px] h-[40px] bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 border-2 border-slate-600 shadow-xl rounded-r z-10 box-border">
                <MainScaleMarks />
                <div className="absolute left-[20px] top-[10px] text-slate-400 text-xs font-bold opacity-30 tracking-widest pointer-events-none">VERNIER CALIPER 0.01 CM</div>
            </div>
            
            {/* FIXED JAW Base */}
            <div className="absolute left-[60px] top-[150px] w-[40px] h-[40px] bg-slate-800 border-2 border-slate-600 z-10 rounded-l" />
            {/* FIXED JAW Downward Arm */}
            <div className="absolute left-[60px] top-[190px] w-[40px] h-[30px] bg-slate-900 z-0 rounded-bl" />
            {/* FIXED JAW Upward Arm (The Measurement Arm) */}
            <div 
                className="absolute left-[60px] top-[10px] w-[40px] h-[140px] bg-gradient-to-b from-slate-600 to-slate-800 shadow-2xl z-20 rounded-tl-xl border-l-[3px] border-slate-500 overflow-hidden box-border"
                style={{ clipPath: 'polygon(0 15%, 100% 0, 100% 100%, 0 100%)' }}
            >
                <div className="absolute right-[0px] top-0 w-[4px] h-full bg-cyan-400/80 shadow-[0_0_10px_theme(colors.cyan.400)]" />
            </div>

            {/* OBJECT RENDERING */}
            {!isLens && objectWidth > 0 && (
                <motion.img 
                    src="/assets/benda-piston.png" 
                    className="absolute top-[30px] h-[120px] z-10 object-fill shadow-2xl drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)]"
                    style={{ left: 100, width: objectWidth * SCALE_PX_PER_CM }}
                    alt="object"
                />
            )}

            {/* SLIDING JAW CONTAINER */}
            <motion.div style={{ x: jawX }} className="absolute left-[100px] top-[190px] w-[220px] z-30">
                {/* Slider Body */}
                <div className="absolute left-0 top-0 w-[200px] h-[45px] bg-gradient-to-r from-slate-700 to-slate-800 border-2 border-slate-500 shadow-[20px_20px_30px_rgba(0,0,0,0.5)] rounded-br-lg box-border">
                    <VernierScaleMarks />
                    <div className="absolute right-[12px] top-[10px] flex gap-[3px] flex-col h-[25px] w-[20px] items-center justify-center bg-slate-800 rounded border border-slate-600 shadow-inner">
                        {[1,2,3].map(i => <div key={i} className="w-[12px] h-[2px] bg-slate-600 rounded-full" />)}
                    </div>
                </div>
                
                {/* Slider Arm Upward */}
                <div 
                    className="absolute left-[0px] top-[-180px] w-[40px] h-[180px] bg-gradient-to-b from-slate-600 to-slate-800 shadow-[-15px_0_25px_rgba(0,0,0,0.6)] rounded-tr-xl border-r-[3px] border-slate-500 overflow-hidden box-border"
                    style={{ clipPath: 'polygon(0 0, 100% 15%, 100% 100%, 0 100%)' }}
                >
                    <div className="absolute left-[0px] top-0 w-[4px] h-full bg-cyan-400/80 shadow-[0_0_10px_theme(colors.cyan.400)]" />
                </div>
                {/* Locking Screw */}
                <div className="absolute left-[15px] top-[-8px] w-[16px] h-[12px] bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-700 rounded-t shadow-lg flex flex-col justify-evenly px-[2px]">
                   <div className="w-full h-[1px] bg-amber-800/50" /><div className="w-full h-[1px] bg-amber-800/50" />
                </div>
            </motion.div>
        </div>
    );
};

const PlayingArea = ({ health, setHealth, partsFixed, setPartsFixed, setGameState }: any) => {
    const [currentWidth, setCurrentWidth] = useState(0);
    const jawX = useMotionValue(0);
    const [activeInput, setActiveInput] = useState<'SU'|'SN'>('SU');
    const [suValue, setSuValue] = useState("");
    const [snValue, setSnValue] = useState("");
    const [statusText, setStatusText] = useState("AWAITING CALIBRATION...");
    const [statusColor, setStatusColor] = useState("text-amber-400");
    const containerScope = useRef<HTMLDivElement>(null);

    const generateNewObject = () => {
        const w = (Math.floor(Math.random() * 251) + 150) / 100; // 1.50 to 4.00
        setCurrentWidth(w);
        jawX.set(0);
        setSuValue("");
        setSnValue("");
        setActiveInput('SU');
        setStatusText("SYSTEM READY. MEASURE COMPONENT.");
        setStatusColor("text-amber-400 drop-shadow-[0_0_5px_theme(colors.amber.400)]");
    };

    useEffect(() => {
        generateNewObject();
    }, []);

    const handleKeypad = (val: string) => {
        if (statusText === "CALIBRATION PERFECT!" || statusText === "CALIBRATION FAILED!") return;
        playSound('/assets/sfx-benar.wav'); // subtle tick

        if (val === 'DEL') {
            if (activeInput === 'SU') setSuValue(v => v.slice(0, -1));
            else setSnValue(v => v.slice(0, -1));
        } else if (val === '.') {
            if (activeInput === 'SU' && !suValue.includes('.')) setSuValue(v => v + '.');
        } else {
            if (activeInput === 'SU') {
                if (suValue.length < 5) setSuValue(v => v + val);
            } else {
                if (snValue.length < 2) setSnValue(v => v + val);
            }
        }
    };

    const handleEngage = async () => {
        if (statusText === "CALIBRATION PERFECT!" || statusText === "CALIBRATION FAILED!") return;

        const expectedJawPos = currentWidth;
        const currentJawPosRaw = jawX.get() / SCALE_PX_PER_CM;
        const currentJawPos = parseFloat(currentJawPosRaw.toFixed(2));
        
        const suNum = parseFloat(suValue) || 0;
        const snNum = parseInt(snValue) || 0;
        const totalInput = parseFloat((suNum + snNum * 0.01).toFixed(2));

        const isSnapped = Math.abs(currentJawPos - expectedJawPos) < 0.02;
        const isMathExact = Math.abs(totalInput - currentJawPos) < 0.01;

        if (isSnapped && isMathExact) {
            playSound('/assets/sfx-benar.wav');
            setStatusText("CALIBRATION PERFECT!");
            setStatusColor("text-cyan-400 drop-shadow-[0_0_15px_theme(colors.cyan.400)]");
            
            await animate(containerScope.current!, { backgroundColor: ['#0f172a', '#064e3b', '#0f172a'] }, { duration: 0.5 });
            
            const newScore = partsFixed + 1;
            setPartsFixed(newScore);
            
            if (newScore >= 5) {
                setTimeout(() => setGameState('VICTORY'), 1500);
            } else {
                setTimeout(generateNewObject, 1500);
            }
        } else {
            playSound('/assets/sfx-salah.wav');
            setStatusText("CALIBRATION FAILED!");
            setStatusColor("text-red-500 drop-shadow-[0_0_15px_theme(colors.red.600)]");
            
            animate(containerScope.current!, { x: [-20, 20, -20, 20, 0] }, { duration: 0.4 });
            animate(containerScope.current!, { backgroundColor: ['#0f172a', '#450a0a', '#0f172a'] }, { duration: 0.4 });
            
            const newHealth = health - 1;
            setHealth(newHealth);
            
            if (newHealth <= 0) {
                setTimeout(() => setGameState('GAME_OVER'), 1500);
            } else {
                setTimeout(() => {
                    setStatusText("SYSTEM READY. MEASURE COMPONENT.");
                    setStatusColor("text-amber-400 drop-shadow-[0_0_5px_theme(colors.amber.400)]");
                }, 1500);
            }
        }
    };

    return (
        <div ref={containerScope} className="absolute inset-0 flex bg-slate-900/60 font-mono transition-colors">
            
            {/* HUD */}
            <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start pointer-events-none z-40">
                <div className="flex gap-3 bg-slate-950/80 p-4 rounded-xl border-2 border-cyan-500/50 shadow-[0_0_20px_theme(colors.cyan.900)] backdrop-blur">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={`relative ${i < health ? 'text-amber-400 drop-shadow-[0_0_10px_theme(colors.amber.400)]' : 'text-slate-800'}`}>
                            {i < health ? <BatteryFull size={36} /> : <Battery size={36} />}
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-xl border-2 border-cyan-500/50 shadow-[0_0_20px_theme(colors.cyan.900)] backdrop-blur">
                    <Gauge size={32} className="text-cyan-400" />
                    <div className="text-3xl font-black text-cyan-300 tracking-widest drop-shadow-[0_0_10px_theme(colors.cyan.400)]">
                        FIXED: {partsFixed} / 5
                    </div>
                </div>
            </div>

            {/* Core Workspace */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                <div className="relative w-[800px] h-[400px] flex-shrink-0" style={{ transform: 'scale(1.1) translateY(40px)' }}>
                    <CaliperRender jawX={jawX} objectWidth={currentWidth} />

                    {/* Draggable Interaction Layer */}
                    <motion.div 
                        drag="x" dragMomentum={false} dragConstraints={{ left: 0, right: 410 }}
                        onDragEnd={() => {
                            const target = currentWidth * SCALE_PX_PER_CM;
                            if (Math.abs(jawX.get() - target) < 50) {
                                playSound('/assets/sfx-benar.wav');
                                animate(jawX, target, { type: 'spring', stiffness: 350, damping: 20 });
                            }
                        }}
                        style={{ x: jawX }}
                        className="absolute left-[100px] top-[190px] w-[200px] h-[100px] cursor-grab active:cursor-grabbing z-40"
                    />

                    {/* Magnifier Lens */}
                    <motion.div 
                        className="absolute top-[10px] w-[220px] h-[220px] rounded-full border-[8px] border-amber-400 shadow-[0_0_40px_theme(colors.cyan.500)] overflow-hidden pointer-events-none z-50 bg-slate-900 drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)]"
                        style={{ left: useTransform(jawX, v => {
                            const sj = Math.round(v);
                            return 100 + sj + (sj % 10) * 9 - 110; 
                        })}}
                    >
                        <motion.div 
                            className="absolute origin-top-left flex items-center justify-center"
                            style={{
                                scale: 2.8,
                                x: useTransform(jawX, v => {
                                    const sj = Math.round(v);
                                    const ix = 100 + sj + (sj % 10) * 9;
                                    return -ix * 2.8 + 110;
                                }),
                                y: -190 * 2.8 + 110
                            }}
                        >
                            <CaliperRender jawX={jawX} objectWidth={currentWidth} isLens />
                        </motion.div>
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-60">
                            <div className="w-[2px] h-[40px] bg-red-400 absolute top-[90px] shadow-[0_0_8px_theme(colors.red.500)]" />
                            <div className="w-[40px] h-[2px] bg-red-400 absolute top-[110px] shadow-[0_0_8px_theme(colors.red.500)]" />
                        </div>
                        
                        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_40px_rgba(0,0,0,0.9)] mix-blend-multiply" />
                        <div className="absolute inset-x-8 top-4 bottom-1/2 rounded-full bg-gradient-to-b from-white/20 to-transparent blur-md" />
                    </motion.div>
                </div>
            </div>

            {/* Custom Terminal Keypad */}
            <div className="w-[400px] bg-slate-950 border-l border-cyan-500 shrink-0 shadow-[-20px_0_40px_rgba(0,0,0,0.7)] flex flex-col p-8 z-40 relative">
                <h2 className="text-2xl text-amber-500 font-bold mb-8 text-center border-b-2 border-slate-700 pb-4 tracking-widest flex items-center justify-center gap-3 drop-shadow-[0_0_5px_theme(colors.amber.500)]">
                    <Calculator size={24} /> TERMINAL INPUT
                </h2>

                <div className="flex gap-4 mb-8">
                    <div 
                        className={`flex-1 flex flex-col items-center bg-slate-900 border-[3px] rounded-xl p-4 cursor-pointer transition-all ${activeInput === 'SU' ? 'border-amber-400 shadow-[0_0_20px_theme(colors.amber.500/40)] scale-105' : 'border-slate-800 hover:border-slate-600'}`}
                        onClick={() => setActiveInput('SU')}
                    >
                        <div className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-2">SU (cm)</div>
                        <div className={`text-4xl font-black ${activeInput === 'SU' ? 'text-amber-400 drop-shadow-[0_0_10px_theme(colors.amber.500)]' : 'text-cyan-400/50'}`}>
                            {suValue || "0.0"}
                        </div>
                    </div>
                    <div 
                        className={`flex-1 flex flex-col items-center bg-slate-900 border-[3px] rounded-xl p-4 cursor-pointer transition-all ${activeInput === 'SN' ? 'border-amber-400 shadow-[0_0_20px_theme(colors.amber.500/40)] scale-105' : 'border-slate-800 hover:border-slate-600'}`}
                        onClick={() => setActiveInput('SN')}
                    >
                        <div className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-2">SN</div>
                        <div className={`text-4xl font-black ${activeInput === 'SN' ? 'text-amber-400 drop-shadow-[0_0_10px_theme(colors.amber.500)]' : 'text-cyan-400/50'}`}>
                            {snValue || "0"}
                        </div>
                    </div>
                </div>

                <div className={`text-center text-sm mb-8 h-[24px] font-black tracking-widest ${statusColor} animate-pulse`}>
                    {statusText}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    {['7','8','9','4','5','6','1','2','3','0','.','DEL'].map(btn => (
                        <button 
                            key={btn}
                            onClick={() => handleKeypad(btn)}
                            className={`py-5 text-2xl font-black rounded-lg bg-slate-800 border-b-[6px] border-slate-950 active:border-b-0 active:translate-y-[6px] transition-all
                                ${btn === 'DEL' ? 'text-red-400 hover:bg-red-950 hover:text-red-300 border-t border-red-900 shadow-[0_5px_10px_rgba(200,0,0,0.2)]' : 'text-cyan-100 hover:bg-slate-700 hover:text-white border-t border-slate-600 shadow-[0_5px_10px_rgba(0,100,200,0.2)]'}
                            `}
                        >
                            {btn}
                        </button>
                    ))}
                </div>

                <button 
                    onClick={handleEngage}
                    className="w-full mt-auto py-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-3xl tracking-[0.2em] rounded-xl uppercase shadow-[0_0_30px_theme(colors.amber.600)] transition-transform hover:scale-[1.03] active:scale-[0.97] border-2 border-amber-200 flex items-center justify-center gap-4"
                >
                    <AlertTriangle className="text-slate-950" size={32} /> ENGAGE
                </button>
            </div>
        </div>
    );
};

const StartScreen = ({ onStart }: any) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md z-50">
        <h1 className="text-[6rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-cyan-400 to-blue-500 drop-shadow-[0_0_30px_theme(colors.cyan.400)] mb-6 text-center select-none">
            REKAUKUR<br/><span className="text-[4rem] text-red-500 drop-shadow-[0_0_20px_theme(colors.red.600)] uppercase">Zero Tolerance</span>
        </h1>
        <p className="text-cyan-300 text-2xl font-mono mb-16 tracking-widest bg-cyan-900/40 px-6 py-2 rounded-full border border-cyan-500/50">PHYSICS WORKSHOP SIMULATOR</p>
        <button 
            onClick={onStart}
            className="px-16 py-6 bg-cyan-600 hover:bg-cyan-500 border-2 border-cyan-300 rounded font-black text-3xl text-white tracking-widest shadow-[0_0_40px_theme(colors.cyan.500)] active:scale-95 transition-all"
        >
            INITIALIZE
        </button>
    </div>
);

const DialogueScreen = ({ onNext }: any) => (
    <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 flex flex-col justify-end bg-slate-950/80 p-12 z-50 backdrop-blur flex-shrink-0 cursor-pointer"
        onClick={onNext}
    >
        <motion.img 
            initial={{ x: -200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', damping: 15 }}
            src="/assets/karakter.png" 
            className="absolute bottom-[-20px] left-[5%] h-[85vh] object-contain pointer-events-none drop-shadow-[20px_0_30px_rgba(0,0,0,0.8)]"
        />
        <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            className="relative ml-[35%] mr-[10%] mb-[5%] bg-slate-900/95 border border-cyan-500 p-10 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.2)]"
        >
            <div className="absolute top-[-20px] left-[40px] bg-slate-950 border border-amber-500 px-6 py-2 text-xl text-amber-500 font-black tracking-widest uppercase rounded">
                Chief Engineer
            </div>
            <p className="text-2xl text-cyan-50 font-medium leading-relaxed font-sans mb-8 mt-4">
                "Mesin-mesin di vektor sigma dalam kondisi kritis. Komponen pengganti butuh kalibrasi presisi dengan Zero Tolerance. Aku butuh kamu mengukur komponen ini menggunakan Jangka Sorong. Lakukan dengan teliti."
            </p>
            <motion.div 
                animate={{ x: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex items-center justify-end gap-2 text-cyan-400 font-black tracking-widest uppercase text-sm"
            >
                Klik untuk memulai <ChevronRight size={20} />
            </motion.div>
        </motion.div>
    </motion.div>
);

const GameOverScreen = ({ onRestart }: any) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 backdrop-blur-lg z-50">
        <AlertTriangle size={120} className="text-red-500 mb-8 drop-shadow-[0_0_50px_theme(colors.red.600)] animate-pulse" />
        <h1 className="text-7xl font-black text-red-500 tracking-[0.2em] drop-shadow-[0_0_30px_theme(colors.red.600)] mb-8">
            SYSTEM FAILURE
        </h1>
        <p className="text-red-200 text-3xl mb-16 font-mono text-center tracking-wide leading-relaxed">
            Toleransi presisi terlampaui.<br/>Workshop hancur berantakan.
        </p>
        <button onClick={onRestart} className="px-16 py-6 bg-red-800 hover:bg-red-700 border-2 border-red-400 text-white font-black rounded text-2xl tracking-[0.3em] shadow-[0_0_40px_theme(colors.red.600)] active:scale-95 transition-all">
            REBOOT SEQUENCE
        </button>
    </div>
);

const VictoryScreen = ({ onRestart }: any) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-950/90 backdrop-blur-lg z-50">
        <div className="relative">
            <CheckCircle2 size={150} className="text-cyan-400 mb-10 drop-shadow-[0_0_60px_theme(colors.cyan.400)]" />
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="absolute inset-[-40px] border-4 border-dashed border-cyan-500/50 rounded-full" />
        </div>
        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 drop-shadow-[0_0_30px_theme(colors.cyan.500)] mb-8 text-center tracking-[0.1em]">
            ALL SYSTEMS OPERATIONAL
        </h1>
        <p className="text-cyan-100 text-3xl mb-16 font-mono text-center tracking-wide leading-relaxed">
            Kalibrasi sempurna.<br/>Integritas workshop pulih 100%.
        </p>
        <button onClick={onRestart} className="px-16 py-6 bg-cyan-700 hover:bg-cyan-600 border-2 border-cyan-300 text-white font-black rounded text-2xl tracking-[0.3em] shadow-[0_0_40px_theme(colors.cyan.500)] active:scale-95 transition-all">
            RETURN TO BASE
        </button>
    </div>
);

export default function App() {
    const [gameState, setGameState] = useState<'START'|'DIALOGUE'|'PLAYING'|'GAME_OVER'|'VICTORY'>('START');
    const [health, setHealth] = useState(3);
    const [partsFixed, setPartsFixed] = useState(0);

    const resetGame = () => {
        setHealth(3);
        setPartsFixed(0);
        setGameState('PLAYING');
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-slate-950 font-sans select-none text-slate-100 flex items-center justify-center">
            {/* Absolute Background */}
            <div className="absolute inset-0 bg-slate-950 z-[-2]" />
            <img 
                src="/assets/bg-bengkel.jpg" 
                className="absolute inset-0 w-full h-full object-cover z-[-1] opacity-40 mix-blend-screen pointer-events-none" 
                alt="background" 
            />
            
            {gameState === 'START' && <StartScreen onStart={() => setGameState('DIALOGUE')} />}
            {gameState === 'DIALOGUE' && <DialogueScreen onNext={() => setGameState('PLAYING')} />}
            {gameState === 'PLAYING' && (
                <PlayingArea 
                    health={health} setHealth={setHealth} 
                    partsFixed={partsFixed} setPartsFixed={setPartsFixed} 
                    setGameState={setGameState} 
                />
            )}
            {gameState === 'GAME_OVER' && <GameOverScreen onRestart={resetGame} />}
            {gameState === 'VICTORY' && <VictoryScreen onRestart={resetGame} />}
        </div>
    );
}
