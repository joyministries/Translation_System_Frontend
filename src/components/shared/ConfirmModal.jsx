import { Button } from './Button';
import { Modal } from './Modal';

export function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      actions={
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDangerous ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </div>
      }
    >
      <p className="text-gray-700">{message}</p>
    </Modal>
  );
}
