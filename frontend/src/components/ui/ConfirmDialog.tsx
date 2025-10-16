interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "btn btn-danger"
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-red-600 mb-4">
          {title}
        </h3>
        <p className="text-gray-700 mb-6">
          {message}
        </p>
        
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="btn btn-secondary flex-1"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`${confirmButtonClass} flex-1`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
