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
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 bg-black/60 dark:bg-black/80"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
        className="border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col focus:outline-none transition-colors duration-200" 
        tabIndex="-1"
      >
        <div 
          style={{ borderBottomColor: 'var(--border-default)' }}
          className="border-b px-6 py-4 flex-shrink-0 flex items-center justify-between"
        >
          <h2 id="modal-title" style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold">{title}</h2>
          {onClose && (
            <button
              onClick={onClose}
              style={{ color: 'var(--text-secondary)' }}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Close modal"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
        {actions && (
          <div 
            style={{ borderTopColor: 'var(--border-default)' }}
            className="border-t px-6 py-4 flex gap-2 justify-end flex-shrink-0"
          >
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
            style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)' }}
            className="px-4 py-2 rounded-lg font-medium hover:opacity-80 transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white font-medium rounded-lg transition ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-brand-600 hover:bg-brand-700'
            }`}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
    </Modal>
  );
}
