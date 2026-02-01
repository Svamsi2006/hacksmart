import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, CheckCircle, XCircle, Zap, Fingerprint, Scan, Battery, BatteryCharging } from 'lucide-react';

const LoginScreen = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [scanLine, setScanLine] = useState(0);
  const [glitchText, setGlitchText] = useState(false);
  const inputRef = useRef(null);
  
  // The secret PIN
  const CORRECT_PIN = '1111';
  
  // Focus input on mount for keyboard typing
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Glitch effect interval
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitchText(true);
      setTimeout(() => setGlitchText(false), 100);
    }, 3000);
    return () => clearInterval(glitchInterval);
  }, []);

  // Scan line animation
  useEffect(() => {
    const scanInterval = setInterval(() => {
      setScanLine(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(scanInterval);
  }, []);
  
  // Handle keyboard input
  const handleKeyDown = (e) => {
    if (success) return;
    
    if (e.key >= '0' && e.key <= '9') {
      handlePinInput(e.key);
    } else if (e.key === 'Backspace') {
      handleBackspace();
    } else if (e.key === 'Escape') {
      handleClear();
    }
  };
  
  const handlePinInput = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 4) {
        // Check PIN after a short delay for effect
        setTimeout(() => {
          if (newPin === CORRECT_PIN) {
            setSuccess(true);
            setTimeout(() => onLogin(), 1500);
          } else {
            setError(true);
            setShake(true);
            setTimeout(() => {
              setPin('');
              setShake(false);
            }, 600);
          }
        }, 300);
      }
    }
  };
  
  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };
  
  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '✕', '0', '←'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center min-h-screen overflow-hidden"
      style={{ 
        background: 'linear-gradient(180deg, #000000 0%, #0d0d0d 50%, #1a0a2e 100%)'
      }}
    >
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Scan line effect */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent pointer-events-none"
        style={{ top: `${scanLine}%` }}
      />

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: `${150 + i * 50}px`,
              height: `${150 + i * 50}px`,
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              background: i % 2 === 0 
                ? 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)'
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Neon border frame */}
      <div className="absolute inset-4 border border-violet-500/20 rounded-3xl pointer-events-none">
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
        <div className="absolute bottom-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />
      </div>

      {/* Main content container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Logo & Title */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-10 text-center"
        >
          {/* Animated battery icon */}
          <motion.div
            className="relative w-28 h-28 mx-auto mb-6"
            animate={success ? { scale: [1, 1.2, 1] } : {}}
          >
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600/20 to-pink-600/20 backdrop-blur-sm border border-violet-500/30"
              animate={{
                boxShadow: success 
                  ? ['0 0 20px rgba(139,92,246,0.3)', '0 0 60px rgba(139,92,246,0.6)', '0 0 20px rgba(139,92,246,0.3)']
                  : ['0 0 20px rgba(139,92,246,0.2)', '0 0 40px rgba(139,92,246,0.3)', '0 0 20px rgba(139,92,246,0.2)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {success ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle className="w-14 h-14 text-emerald-400" />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <BatteryCharging className="w-14 h-14 text-violet-400" />
                </motion.div>
              )}
            </div>
            
            {/* Orbiting dots */}
            {!success && [...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-violet-400"
                style={{ 
                  top: '50%', 
                  left: '50%',
                  boxShadow: '0 0 10px rgba(139,92,246,0.8)'
                }}
                animate={{
                  x: [0, Math.cos(i * 2.1) * 50, 0],
                  y: [0, Math.sin(i * 2.1) * 50, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}
          </motion.div>

          <motion.h1 
            className={`text-4xl font-black tracking-tight mb-2 ${glitchText ? 'translate-x-[2px]' : ''}`}
            style={{
              background: 'linear-gradient(135deg, #c084fc 0%, #f472b6 50%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: glitchText ? '2px 0 #f472b6, -2px 0 #818cf8' : 'none',
              fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif'
            }}
          >
            SMART-AUDIT
          </motion.h1>
          <motion.p 
            className="text-violet-300/70 text-sm tracking-[0.3em] uppercase font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Neural Access Terminal
          </motion.p>
        </motion.div>

        {/* Security badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20"
        >
          <Fingerprint className="w-4 h-4 text-violet-400" />
          <span className="text-xs text-violet-300/80 font-mono tracking-wider">BIOMETRIC OVERRIDE</span>
        </motion.div>
      
        {/* Hidden input for keyboard typing */}
        <input
          ref={inputRef}
          type="text"
          className="opacity-0 absolute w-0 h-0"
          onKeyDown={handleKeyDown}
          onBlur={() => inputRef.current?.focus()}
          autoFocus
        />

        {/* PIN Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className={`flex gap-5 mb-8 ${shake ? 'animate-shake' : ''}`}
        >
          {[0, 1, 2, 3].map((index) => (
            <motion.div
              key={index}
              className="relative"
              animate={pin.length > index ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.2 }}
            >
              {/* Glow effect */}
              <motion.div
                className={`absolute -inset-1 rounded-2xl blur-md transition-all duration-300 ${
                  pin.length > index 
                    ? error 
                      ? 'bg-red-500/40' 
                      : success
                        ? 'bg-emerald-500/40'
                        : 'bg-violet-500/40' 
                    : 'bg-transparent'
                }`}
              />
              
              <div
                className={`relative w-16 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold transition-all duration-300 ${
                  pin.length > index 
                    ? error 
                      ? 'border-2 border-red-500 bg-red-500/10' 
                      : success
                        ? 'border-2 border-emerald-400 bg-emerald-500/10'
                        : 'border-2 border-violet-400 bg-violet-500/10' 
                    : 'border-2 border-gray-700/50 bg-gray-900/50'
                } backdrop-blur-sm`}
              >
                {pin.length > index && (
                  <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className={`w-4 h-4 rounded-full ${
                      error ? 'bg-red-400' : success ? 'bg-emerald-400' : 'bg-violet-400'
                    }`}
                    style={{
                      boxShadow: error 
                        ? '0 0 20px rgba(239,68,68,0.8)' 
                        : success 
                          ? '0 0 20px rgba(52,211,153,0.8)'
                          : '0 0 20px rgba(139,92,246,0.8)'
                    }}
                  />
                )}
                
                {/* Index indicator */}
                <span className="absolute bottom-1 text-[10px] text-gray-600 font-mono">
                  {index + 1}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Status Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 mb-6 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30"
            >
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm font-medium tracking-wide">ACCESS DENIED</span>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="flex items-center gap-2 mb-6 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium tracking-wide">ACCESS GRANTED</span>
            </motion.div>
          )}
          {!error && !success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 mb-6 px-4 py-2 rounded-xl bg-gray-800/30"
            >
              <Scan className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500 text-sm font-mono tracking-wider">AWAITING INPUT...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PIN Pad */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-3"
        >
          {digits.map((digit, index) => (
            <motion.button
              key={digit}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.03 }}
              whileHover={{ 
                scale: 1.08, 
                boxShadow: '0 0 25px rgba(139,92,246,0.4)',
              }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                if (digit === '✕') handleClear();
                else if (digit === '←') handleBackspace();
                else handlePinInput(digit);
              }}
              className={`relative w-18 h-18 rounded-2xl text-xl font-bold transition-all overflow-hidden ${
                digit === '✕' || digit === '←'
                  ? 'bg-gray-800/60 text-gray-400 hover:text-white border border-gray-700/50'
                  : 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 text-white border border-gray-700/30'
              } backdrop-blur-sm`}
              style={{ width: '72px', height: '72px' }}
              disabled={success}
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-pink-500/0 hover:from-violet-500/20 hover:to-pink-500/10 transition-all" />
              
              <span className="relative z-10 font-mono">{digit}</span>
              
              {/* Bottom accent */}
              {digit !== '✕' && digit !== '←' && (
                <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-violet-500/50 via-pink-500/50 to-violet-500/50 opacity-0 group-hover:opacity-100" />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-600 text-xs font-mono tracking-wider">
            [ HINT: ENTER YEAR <span className="text-violet-400">2026</span> → <span className="text-pink-400">1111</span> ]
          </p>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-6 text-center z-10"
      >
        <div className="flex items-center gap-3 text-gray-600 text-xs font-mono">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SYSTEM ONLINE</span>
          </div>
          <span className="text-gray-700">|</span>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>AES-256 ENCRYPTED</span>
          </div>
          <span className="text-gray-700">|</span>
          <span className="text-violet-400/60">BATTERY SMART</span>
        </div>
      </motion.div>

      {/* Success overlay */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-violet-900/20 to-emerald-900/20 pointer-events-none"
          >
            {/* Success particles */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-emerald-400 rounded-full"
                style={{
                  left: `${50 + (Math.random() - 0.5) * 30}%`,
                  top: '50%',
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: (Math.random() - 0.5) * 300,
                  y: (Math.random() - 0.5) * 300,
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.02,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      `}</style>
    </motion.div>
  );
};

export default LoginScreen;
