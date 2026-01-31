import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';

const KPICard = ({ title, value, icon: Icon, trend, helper, suffix = '', prefix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Animate counter
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

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
      className="bg-white rounded-card p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-teal/10 rounded-xl">
          <Icon className="w-6 h-6 text-teal" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${trend > 0 ? 'text-teal' : 'text-danger'}`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      <h3 className="text-3xl font-bold text-navy mb-2">
        {prefix}
        {typeof value === 'number' && value % 1 !== 0 ? displayValue.toFixed(1) : formatValue(displayValue)}
        {suffix}
      </h3>
      
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      {helper && <p className="text-xs text-gray-400">{helper}</p>}
    </motion.div>
  );
};

export default KPICard;
