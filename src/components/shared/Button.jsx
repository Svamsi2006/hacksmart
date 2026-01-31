const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const variants = {
    primary: 'bg-teal hover:bg-teal/90 text-white',
    secondary: 'bg-navy hover:bg-navy/90 text-white',
    outline: 'border-2 border-teal text-teal hover:bg-teal hover:text-white',
    danger: 'bg-danger hover:bg-danger/90 text-white',
    ghost: 'hover:bg-gray-100 text-gray-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`
        font-semibold rounded-lg transition-all
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
