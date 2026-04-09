// Reusable input component
export function Input({ label, error, ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
          error ? 'border-error' : 'border-gray-300'
        }`}
      />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}
