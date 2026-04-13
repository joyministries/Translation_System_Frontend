import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { Button } from '../../components/shared/Button';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { adminAPI } from '../../api/admin.jsx';
import toast from 'react-hot-toast';
import { Spinner } from '../../components/shared/Spinner';
import { EmptyState } from '../../components/shared/EmptyState';

export function Institutions() {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5, // Lower limit for this page as it has more content per item
    total: 0,
    totalPages: 1,
  });

  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await adminAPI.institutions.getInstitutions(pagination.page, pagination.limit);
        setInstitutions(res.data.institutions);
        setPagination(prev => ({
          ...prev,
          total: res.total,
          totalPages: Math.ceil(res.total / prev.limit),
        }));
      } catch (error) {
        console.error('Failed to fetch institutions:', error);
        toast.error('Failed to load institutions. Please try again later.');
      } finally {
      setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center mb-8">
        <Button onClick={() => navigate(-1)} variant="icon" className="mr-4">
          <MdArrowBack size={24} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Institutions</h1>
          <p className="text-gray-600 mt-2">
            Assign available books to different institutions.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading Institutions...</p>
        </div>
      ) : institutions.length === 0 ? (
        <EmptyState
          title="No Institutions Found"
          message="There are no institutions to display. Contact support to add a new institution."
        />
      ) : (
        <div className="space-y-4">
          {institutions.map((inst) => (
            <div key={inst.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(inst.id)}
              >
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{inst.name}</h2>
                  <p className="text-sm text-gray-500">{inst.code}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && institutions.length > 0 && (
        <div className="mt-8 flex items-center justify-between">
           <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  Next
                </Button>
              </nav>
            </div>
        </div>
      )}
    </div>
  );
}
