// Reusable modal/dialog component
import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, title, children, actions, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 bg-black/40"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col focus:outline-none" tabIndex="-1">
        <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900">{title}</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700 cursor-pointer"
              aria-label="Close modal"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
        {actions && (
          <div className="border-t border-gray-200 px-6 py-4 flex gap-2 justify-end flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// Confirm Modal for destructive actions
export function ConfirmModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  confirmLabel = 'Confirm', 
  cancelLabel = 'Cancel',
  onConfirm,
  isDangerous = false 
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      actions={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white rounded-lg ${
              isDangerous
                ? 'bg-error hover:bg-red-700'
                : 'bg-primary hover:bg-blue-700'
            }`}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-gray-600">{message}</p>
    </Modal>
  );
}
