const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    low: 'bg-teal/10 text-teal',
    medium: 'bg-amber/10 text-amber',
    high: 'bg-danger/10 text-danger',
    critical: 'bg-danger text-white',
    positive: 'bg-teal/10 text-teal',
    neutral: 'bg-gray-100 text-gray-600',
    negative: 'bg-danger/10 text-danger',
    'needs-attention': 'bg-amber/10 text-amber',
    'improving': 'bg-blue-100 text-blue-600',
    'high-performer': 'bg-teal/10 text-teal',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
