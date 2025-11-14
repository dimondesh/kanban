import { useCallback } from "react";
import { useSubmitOnEnter } from "../hooks/useSubmitOnEnter";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDeleting?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title = "Confirm deletion",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isDeleting = false,
  error,
  onConfirm,
  onCancel,
}) => {
  const handleConfirm = useCallback(() => {
    if (isDeleting) return;
    onConfirm();
  }, [isDeleting, onConfirm]);

  useSubmitOnEnter(isOpen, handleConfirm, { disabled: isDeleting });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-6 rounded-xl w-96 shadow-lg space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-center mb-1">{title}</h2>
          <p className="text-sm text-zinc-300 text-center whitespace-pre-line">
            {message}
          </p>
        </div>
        {error && (
          <p className="text-sm text-red-400 text-center" role="alert">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="bg-zinc-600 hover:bg-zinc-500 px-4 py-1.5 rounded disabled:opacity-50"
            onClick={onCancel}
            disabled={isDeleting}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded disabled:opacity-50"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
