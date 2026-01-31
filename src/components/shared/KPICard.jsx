import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const KPICard = ({ title, value, icon: Icon, trend, helper, suffix = '', prefix = '', onClick }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const { isDarkMode } = useTheme();
  const isStringValue = typeof value === 'string';

  useEffect(() => {
    // Skip animation for string values
    if (isStringValue) {
      setDisplayValue(value);
      return;
    }
    
    // Animate counter for numeric values
    const numValue = Number(value) || 0;
    const duration = 2000;
    const steps = 60;
    const increment = numValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= numValue) {
        setDisplayValue(numValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isStringValue]);

  const formatValue = (val) => {
    if (typeof val === 'number' && val >= 1000) {
      return (val / 1000).toFixed(1) + 'K';
    }
    return val;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -2, boxShadow: isDarkMode ? '0 8px 25px rgba(139,92,246,0.15)' : '0 8px 25px rgba(0,0,0,0.1)' }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`rounded-xl md:rounded-card p-4 md:p-6 shadow-sm transition-all ${onClick ? 'cursor-pointer' : ''} ${
        isDarkMode 
          ? 'bg-[#0d0f1a]/80 border border-purple-500/20' 
          : 'bg-white border border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <motion.div 
          className={`p-2 md:p-3 rounded-lg md:rounded-xl ${isDarkMode ? 'bg-cyan-500/20' : 'bg-teal/10'}`}
          whileHover={{ scale: 1.05 }}
        >
          <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isDarkMode ? 'text-cyan-400' : 'text-teal'}`} />
        </motion.div>
        {trend && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className={`flex items-center gap-1 text-xs md:text-sm font-semibold px-2 py-1 rounded-full ${
              trend > 0 
                ? (isDarkMode ? 'text-cyan-400 bg-cyan-500/20' : 'text-teal bg-teal/10')
                : 'text-danger bg-danger/10'
            }`}
          >
            {trend > 0 ? <TrendingUp className="w-3 h-3 md:w-4 md:h-4" /> : <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />}
            <span>{Math.abs(trend)}%</span>
          </motion.div>
        )}
      </div>
      
      <h3 className={`text-2xl md:text-3xl font-bold mb-1 md:mb-2 ${isDarkMode ? 'text-white' : 'text-navy'}`}>
        {prefix}
        {isStringValue ? displayValue : (typeof displayValue === 'number' && displayValue % 1 !== 0 ? displayValue.toFixed(1) : formatValue(displayValue))}
        {suffix}
      </h3>
      
      <p className={`text-xs md:text-sm font-medium mb-0.5 md:mb-1 line-clamp-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
      {helper && <p className={`text-[10px] md:text-xs line-clamp-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{helper}</p>}
    </motion.div>
  );
};

export default KPICard;
