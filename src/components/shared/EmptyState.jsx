// Reusable empty/error state component
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
