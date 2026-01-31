import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggleDarkMode}
      className={`relative w-14 h-7 rounded-full p-1 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600' 
          : 'bg-gradient-to-r from-amber-400 to-orange-400'
      }`}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {/* Track glow effect */}
      <div className={`absolute inset-0 rounded-full blur-sm ${
        isDarkMode ? 'bg-indigo-500/50' : 'bg-amber-400/50'
      }`} />
      
      {/* Sliding circle */}
      <motion.div
        className={`relative w-5 h-5 rounded-full flex items-center justify-center ${
          isDarkMode 
            ? 'bg-slate-900' 
            : 'bg-white'
        }`}
        animate={{
          x: isDarkMode ? 26 : 0,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {isDarkMode ? (
          <Moon className="w-3 h-3 text-indigo-300" />
        ) : (
          <Sun className="w-3 h-3 text-amber-500" />
        )}
      </motion.div>
      
      {/* Stars animation for dark mode */}
      {isDarkMode && (
        <>
          <motion.div
            className="absolute top-1 right-8 w-1 h-1 bg-white rounded-full"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1.5 right-10 w-0.5 h-0.5 bg-white rounded-full"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}
    </motion.button>
  );
};

export default DarkModeToggle;
