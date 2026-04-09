// Reusable spinner/loading component
export function Spinner({ size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizes[size]} border-4 border-gray-300 border-t-primary rounded-full animate-spin`} />
  );
}

// Skeleton loader for cards
export function Skeleton({ className = '' }) {
  return (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
  );
}
