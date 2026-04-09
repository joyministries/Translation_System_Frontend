import { Skeleton } from '../shared/Spinner';
import { Badge } from '../shared/Badge';

export function BookCard({ title, subject, gradeLevel, extractionStatus, loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-24 mb-4" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    done: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4 border border-gray-200 cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{title}</h3>
        {extractionStatus && (
          <Badge className={statusColors[extractionStatus] || 'bg-gray-100 text-gray-800'}>
            {extractionStatus}
          </Badge>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">Subject: {subject}</p>
      <p className="text-sm text-gray-600 mb-3">Grade: {gradeLevel}</p>
      <button className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-600 transition">
        View Book
      </button>
    </div>
  );
}
