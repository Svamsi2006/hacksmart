import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Fingerprint, CheckCircle, XCircle, Zap } from 'lucide-react';

const LoginScreen = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  
  // The secret PIN - Battery Smart themed: 2026 (current year)
  const CORRECT_PIN = '2026';
  
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
            setTimeout(() => onLogin(), 1000);
          } else {
            setError(true);
            setShake(true);
            setTimeout(() => {
              setPin('');
              setShake(false);
            }, 500);
          }
        }, 200);
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

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center min-h-screen"
      style={{ 
        background: 'linear-gradient(135deg, #0A1628 0%, #1a2744 50%, #0A1628 100%)'
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-teal/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Ambient glow */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,230,118,0.1) 0%, rgba(0,230,118,0) 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Logo */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8 text-center z-10"
      >
        <motion.img
          src="/battery-smart-logo.svg"
          alt="Battery Smart"
          className="w-24 h-24 mx-auto mb-4"
          style={{ filter: 'drop-shadow(0 0 30px rgba(0,230,118,0.5))' }}
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <h1 className="text-3xl font-bold text-white mb-2">Smart-Audit AI</h1>
        <p className="text-teal text-sm">Battery Smart Intelligence</p>
      </motion.div>

      {/* Lock Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: 'spring' }}
        className="mb-6"
      >
        <motion.div
          className="w-20 h-20 rounded-full bg-gradient-to-br from-teal/20 to-teal/5 flex items-center justify-center border-2 border-teal/30"
          animate={success ? { 
            scale: [1, 1.2, 1],
            borderColor: ['rgba(0,230,118,0.3)', 'rgba(0,230,118,1)', 'rgba(0,230,118,0.3)']
          } : {}}
        >
          {success ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="w-10 h-10 text-teal" />
            </motion.div>
          ) : (
            <Fingerprint className="w-10 h-10 text-teal" />
          )}
        </motion.div>
      </motion.div>

      {/* PIN Display */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className={`flex gap-4 mb-8 ${shake ? 'animate-shake' : ''}`}
      >
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
              pin.length > index 
                ? error 
                  ? 'border-red-500 bg-red-500/20' 
                  : success
                    ? 'border-teal bg-teal/20'
                    : 'border-teal bg-teal/10' 
                : 'border-gray-600 bg-gray-800/50'
            }`}
            animate={pin.length > index ? { scale: [1, 1.1, 1] } : {}}
          >
            {pin.length > index && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={error ? 'text-red-400' : 'text-teal'}
              >
                •
              </motion.span>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-400 text-sm mb-4 flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Incorrect PIN. Try again.
          </motion.p>
        )}
      </AnimatePresence>

      {/* PIN Pad */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-3 gap-3 z-10"
      >
        {digits.map((digit, index) => (
          <motion.button
            key={digit}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(0,230,118,0.1)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (digit === 'C') handleClear();
              else if (digit === '⌫') handleBackspace();
              else handlePinInput(digit);
            }}
            className={`w-16 h-16 rounded-xl text-xl font-semibold transition-all ${
              digit === 'C' || digit === '⌫'
                ? 'bg-gray-800/80 text-gray-400 hover:text-white'
                : 'bg-gray-800/50 text-white hover:bg-teal/20'
            } border border-gray-700/50 backdrop-blur-sm`}
            disabled={success}
          >
            {digit}
          </motion.button>
        ))}
      </motion.div>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-gray-500 text-xs text-center z-10"
      >
        Hint: Enter the current year 🔋
      </motion.p>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 text-center z-10"
      >
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <Shield className="w-4 h-4" />
          <span>Secured by Battery Smart</span>
        </div>
      </motion.div>

      {/* Custom shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </motion.div>
  );
};

export default LoginScreen;
