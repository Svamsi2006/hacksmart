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
      {/* Ambient glow background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
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

      {/* Logo Container */}
      <motion.div
        className="relative z-10"
        animate={{
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,230,118,0.4) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Logo SVG */}
        <motion.svg
          width="120"
          height="120"
          viewBox="0 0 100 100"
          className="relative z-10 drop-shadow-2xl"
          style={{
            filter: 'drop-shadow(0 0 30px rgba(0,230,118,0.5))',
          }}
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E676" />
              <stop offset="100%" stopColor="#00C853" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Top cap */}
          <rect x="35" y="5" width="30" height="8" rx="3" fill="url(#logoGradient)" filter="url(#glow)"/>
          
          {/* Main body - hourglass X shape */}
          <path 
            d="M25 18 L75 18 L75 25 L55 50 L75 75 L75 82 L25 82 L25 75 L45 50 L25 25 Z" 
            fill="url(#logoGradient)"
            filter="url(#glow)"
          />
        </motion.svg>
      </motion.div>

      {/* Brand name */}
      <motion.div
        className="mt-8 text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wider">
          Smart<span style={{ color: '#00E676' }}>Audit</span> AI
        </h1>
        <p className="text-gray-400 text-sm mt-2 tracking-wide">Battery Smart Intelligence</p>
      </motion.div>

      {/* Loading indicator */}
      <motion.div
        className="mt-12 flex items-center gap-3 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {/* Animated dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#00E676' }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        <span className="text-gray-400 text-sm">{message}</span>
      </motion.div>

      {/* Bottom progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden"
        style={{ backgroundColor: 'rgba(0,230,118,0.1)' }}
      >
        <motion.div
          className="h-full"
          style={{ backgroundColor: '#00E676' }}
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
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
