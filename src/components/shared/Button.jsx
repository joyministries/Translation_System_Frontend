// Reusable button component
export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  ...props 
}) {
  const baseStyles = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-700 focus:ring-primary',
    secondary: 'bg-secondary text-white hover:bg-slate-700 focus:ring-secondary',
    danger: 'bg-error text-white hover:bg-red-700 focus:ring-error',
    outline: 'border-2 border-primary text-primary hover:bg-blue-50 focus:ring-primary',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
