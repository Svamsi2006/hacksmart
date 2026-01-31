import { motion } from 'framer-motion';

const Card = ({ children, className = '', animate = true, hover = false }) => {
  const Component = animate ? motion.div : 'div';
  
  return (
    <Component
      {...(animate && {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 }
      })}
      {...(hover && {
        whileHover: { y: -2, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }
      })}
      className={`bg-white rounded-xl md:rounded-card shadow-sm border border-gray-100 transition-shadow ${className}`}
    >
      {children}
    </Component>
  );
};

export default Card;
