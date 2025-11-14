import { useCallback, useEffect, useState } from "react";
import { useSubmitOnEnter } from "../hooks/useSubmitOnEnter";

interface AddBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export const AddBoardModal: React.FC<AddBoardModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [boardName, setBoardName] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setBoardName("");
      setSubmitting(false);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async () => {
    if (!boardName.trim()) {
      setError("Please provide the board name");
      return;
    }
    if (isSubmitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await onCreate(boardName.trim());
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create board";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }, [boardName, isSubmitting, onCreate, onClose]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSubmit();
  };

  useSubmitOnEnter(isOpen, handleSubmit, { disabled: isSubmitting });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-6 rounded-xl w-80 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Create new board
        </h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Enter board name..."
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              className="w-full p-2 rounded bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
              autoFocus={true}
            />
            {error && (
              <p className="text-sm text-red-400 mt-1" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-zinc-600 hover:bg--500 px-3 py-1 rounded disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
