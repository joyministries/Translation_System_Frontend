// Reusable modal/dialog component
import { useEffect } from 'react';

export function Modal({ isOpen, title, children, actions }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="px-6 py-4">{children}</div>
        {actions && (
          <div className="border-t border-gray-200 px-6 py-4 flex gap-2 justify-end">
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
