import { useState } from 'react';
import { MdFilterList, MdClear } from 'react-icons/md';

export function FilterPanel({ onFilterChange = () => {} }) {
  const [filters, setFilters] = useState({
    category: 'All Categories',
  });

  const [openDropdown, setOpenDropdown] = useState(null);

  // Sample data - replace with API data later
  const categoryOptions = [
    'All Categories',
    'Mathematics',
    'English',
    'Science',
    'History',
    'Geography',
    'Biology',
  ];

  const handleFilterChange = (filterType, value) => {
    const updatedFilters = { ...filters, [filterType]: value };
    setFilters(updatedFilters);
    setOpenDropdown(null);
    onFilterChange(updatedFilters);
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4 text-gray-600">
          <MdFilterList size={20} />
          <span className="font-semibold text-gray-700">Filters</span>
        </div>
        <button
          onClick={() => {
            setFilters({
              category: 'All Categories',
            });
            setOpenDropdown(null);
            onFilterChange({
              category: 'All Categories',
            });
          }}
          title="Clear all filters"
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
        >
          <MdClear size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
        
        {/* Category Filter */}
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Category
          </label>
          <button
            onClick={() => toggleDropdown('category')}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition flex items-center justify-between"
          >
            <span className="truncate">{filters.category}</span>
            <span className={`text-lg transform transition-transform ${openDropdown === 'category' ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {/* Dropdown Menu */}
          {openDropdown === 'category' && (
            <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg">
              {categoryOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => handleFilterChange('category', option)}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-blue-50 transition ${
                    filters.category === option
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700'
                  } first:rounded-t-lg last:rounded-b-lg`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
