import { useState, useRef, useEffect } from 'react';
import { MdMoreVert } from 'react-icons/md';

export function ActionDropdown({ actions, isLast }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <MdMoreVert className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 w-44 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1 ${
            isLast ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
          role="menu"
        >
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsOpen(false);
                action.onClick();
              }}
              disabled={action.disabled}
              title={action.title}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors cursor-pointer ${
                action.isDangerous
                  ? 'text-red-600 hover:bg-red-50 disabled:text-red-300 disabled:cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed'
              }`}
              role="menuitem"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
