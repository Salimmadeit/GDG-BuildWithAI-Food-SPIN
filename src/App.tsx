import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Utensils } from 'lucide-react';

const foodSpots = [
  { label: "Jaja", color: "#800000" },
  { label: "New Hall Amala", color: "#FFD700" },
  { label: "Korede Spaghetti", color: "#E74C3C" },
  { label: "Faculty of Arts", color: "#F39C12" },
  { label: "Cook Indomie", color: "#27AE60" }
];

const numSlices = foodSpots.length;
const sliceAngle = (2 * Math.PI) / numSlices;
const friction = 0.99; // Physics slowdown factor

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const angleRef = useRef(0);
  const velocityRef = useRef(0);
  const requestRef = useRef<number>(0);
  const isSpinningRef = useRef(false);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 5;

    foodSpots.forEach((spot, i) => {
      const startAngle = angleRef.current + (i * sliceAngle);
      const endAngle = startAngle + sliceAngle;

      // Draw Slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.fillStyle = spot.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = i === 1 ? 'black' : 'white';
      ctx.font = "900 16px Inter, sans-serif";
      ctx.fillText(spot.label, radius - 20, 0);
      ctx.restore();
    });

    // Center Pin
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "#111";
    ctx.fill();
  };

  const animate = () => {
    if (velocityRef.current > 0.001) {
      angleRef.current += velocityRef.current;
      velocityRef.current *= friction;
      drawWheel();
      requestRef.current = requestAnimationFrame(animate);
    } else if (isSpinningRef.current) {
      isSpinningRef.current = false;
      setIsSpinning(false);
      velocityRef.current = 0;
      showWinner();
    }
  };

  const showWinner = () => {
    const normalizedAngle = (angleRef.current % (2 * Math.PI));
    const totalRotation = (2 * Math.PI) - normalizedAngle;
    const pointerAngle = (totalRotation + (3 * Math.PI / 2)) % (2 * Math.PI);
    const sliceIndex = Math.floor(pointerAngle / sliceAngle) % numSlices;
    
    setWinner(foodSpots[sliceIndex].label);
  };

  const spin = () => {
    if (isSpinningRef.current) return;
    
    isSpinningRef.current = true;
    setIsSpinning(true);
    setWinner(null);
    velocityRef.current = Math.random() * 0.3 + 0.3; // Random high initial velocity
    
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    
    animate();
  };

  // Initial draw
  useEffect(() => {
    drawWheel();
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[#800000]/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-[300px] h-[300px] bg-yellow-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header Section */}
      <div className="text-center z-10 mb-8 mt-12 md:mt-0">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent flex items-center justify-center gap-3">
          <Utensils className="w-8 h-8 md:w-10 md:h-10 text-white" />
          UNILAG Foodie
          <MapPin className="w-8 h-8 md:w-10 md:h-10 text-white" />
        </h1>
        <p className="text-yellow-500 font-mono text-xs md:text-sm tracking-[0.3em] uppercase mt-4">Can't decide? Let the wheel choose your lunch!</p>
      </div>

      {/* Main Game Layout */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-7xl px-4 md:px-16 gap-8 md:gap-12 z-10">
        
        {/* Left Info Panel */}
        <div className="hidden md:block w-64 space-y-8">
          <div className="border-l-2 border-yellow-600 pl-4 py-2">
            <span className="block text-[10px] uppercase tracking-widest text-gray-400">Current Session</span>
            <span className="text-2xl font-bold">{numSlices} Spots Loaded</span>
          </div>
          <div className="space-y-4">
            {foodSpots.map((spot, idx) => (
              <div key={idx} className="flex items-center gap-3 opacity-60">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: spot.color }}></div>
                <span className="text-xs uppercase tracking-wider">{spot.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center: The Wheel Canvas Area */}
        <div className="relative flex-1 flex flex-col items-center w-full max-w-[480px]">
          {/* Top Arrow */}
          <div className="absolute -top-4 z-20">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <path d="M20 40L37.3205 10L2.67949 10L20 40Z" fill="#FFD700" />
            </svg>
          </div>
          
          {/* Wheel Outer Glow */}
          <div className="w-[340px] h-[340px] md:w-[480px] md:h-[480px] rounded-full border border-white/10 flex items-center justify-center bg-[#111] shadow-[0_0_80px_rgba(255,215,0,0.05)] aspect-square">
            <canvas 
              ref={canvasRef} 
              width={450} 
              height={450} 
              className="w-[90%] h-[90%] rounded-full border-[6px] border-[#222]"
            />
          </div>

          <button 
            onClick={spin} 
            disabled={isSpinning}
            className="mt-12 px-12 py-4 text-sm md:text-lg text-black font-black uppercase tracking-widest rounded-full transition-all active:scale-95 shadow-[0_0_30px_rgba(202,138,4,0.3)] bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isSpinning ? 'SPINNING...' : 'Launch Spinner'}
          </button>
        </div>

        {/* Right: Stats Panel */}
        <div className="hidden md:block w-64 text-right space-y-8">
          <div className="border-r-2 border-yellow-600 pr-4 py-2">
            <span className="block text-[10px] uppercase tracking-widest text-gray-400">System Status</span>
            <span className="text-2xl font-bold italic">{isSpinning ? 'Computing' : 'Ready'}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-gray-500">
            Physics-based momentum enabled. Deceleration friction set to {friction}. Probability distribution: Equal.
          </p>
        </div>
      </div>

      {/* Win Modal */}
      <AnimatePresence>
        {winner && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="bg-white text-black p-8 md:p-12 rounded-[40px] text-center max-w-sm w-full border-[10px] border-yellow-500 shadow-2xl"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Victory Selection</span>
              <h2 className="text-3xl md:text-4xl font-black uppercase mb-6 text-neutral-900">{winner}</h2>
              <p className="text-sm text-gray-600 mb-8">The gods of hunger have spoken. Proceed to the spot immediately.</p>
              <button 
                onClick={() => setWinner(null)}
                className="w-full py-4 bg-black text-white font-bold rounded-2xl transition-transform hover:scale-105 active:scale-95"
              >
                Acknowledge
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
