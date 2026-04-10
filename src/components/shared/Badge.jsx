export function Badge({ children, className = '' }) {
  const baseStyles = 'px-3 py-1 rounded-full text-xs font-medium';
  return (
    <span className={`${baseStyles} ${className}`}>
      {children}
    </span>
  );
}
