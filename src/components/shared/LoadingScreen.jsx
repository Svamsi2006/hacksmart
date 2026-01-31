import { motion } from 'framer-motion';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ backgroundColor: '#0A1628' }} // Deep navy blue
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-teal/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut',
            }}
          />
        ))}
        
        {/* Ambient glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,230,118,0.15) 0%, rgba(0,230,118,0) 70%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Logo Container with spinning ring */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Spinning outer ring */}
        <motion.div
          className="absolute -inset-6 rounded-full border-2 border-teal/30"
          style={{
            borderTopColor: '#00E676',
            borderRightColor: 'transparent',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Second spinning ring (reverse) */}
        <motion.div
          className="absolute -inset-10 rounded-full border border-teal/20"
          style={{
            borderBottomColor: '#00E676',
            borderLeftColor: 'transparent',
          }}
          animate={{ rotate: -360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Pulsing glow behind logo */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,230,118,0.5) 0%, transparent 70%)',
            filter: 'blur(25px)',
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Battery Smart Logo */}
        <motion.img
          src="/battery-smart-logo.svg"
          alt="Battery Smart"
          className="w-28 h-28 md:w-36 md:h-36 relative z-10"
          style={{
            filter: 'drop-shadow(0 0 30px rgba(0,230,118,0.6))',
          }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      {/* Brand name with typing effect */}
      <motion.div
        className="mt-10 text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.h1 
          className="text-2xl md:text-4xl font-bold text-white tracking-wider"
          animate={{
            textShadow: [
              '0 0 20px rgba(0,230,118,0.3)',
              '0 0 40px rgba(0,230,118,0.5)',
              '0 0 20px rgba(0,230,118,0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Smart<span style={{ color: '#00E676' }}>Audit</span> AI
        </motion.h1>
        <motion.p 
          className="text-gray-400 text-sm md:text-base mt-3 tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Powered by Battery Smart
        </motion.p>
      </motion.div>

      {/* Loading indicator with battery charging animation */}
      <motion.div
        className="mt-12 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {/* Battery charging animation */}
        <div className="relative w-20 h-10 border-2 border-teal/50 rounded-lg overflow-hidden">
          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-2 h-4 bg-teal/50 rounded-r" />
          <motion.div
            className="absolute inset-1 bg-gradient-to-r from-teal/80 to-teal rounded"
            initial={{ width: '0%' }}
            animate={{ width: ['0%', '100%', '0%'] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* Charging bolt */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
            </svg>
          </motion.div>
        </div>
        
        <motion.p 
          className="text-gray-400 text-sm mt-4 text-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.p>
      </motion.div>

      {/* Bottom progress bar with gradient */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1.5 overflow-hidden"
        style={{ backgroundColor: 'rgba(0,230,118,0.1)' }}
      >
        <motion.div
          className="h-full"
          style={{ 
            background: 'linear-gradient(90deg, transparent, #00E676, transparent)',
            width: '50%',
          }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default LoadingScreen;
