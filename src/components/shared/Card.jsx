import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const Card = ({ children, className = '', animate = true, hover = false }) => {
  const { isDarkMode } = useTheme();
  const Component = animate ? motion.div : 'div';
  
  return (
    <Component
      {...(animate && {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 }
      })}
      {...(hover && {
        whileHover: { y: -2, boxShadow: isDarkMode ? '0 8px 25px rgba(139,92,246,0.15)' : '0 8px 25px rgba(0,0,0,0.1)' }
      })}
      className={`rounded-xl md:rounded-card shadow-sm transition-all duration-300 ${
        isDarkMode 
          ? 'bg-[#0d0f1a]/80 border border-purple-500/20' 
          : 'bg-white border border-gray-100'
      } ${className}`}
    >
      {children}
    </Component>
  );
};

export default Card;
