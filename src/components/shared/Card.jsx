const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-card shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
