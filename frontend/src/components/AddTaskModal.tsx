import { useCallback, useEffect, useState } from "react";
import { useSubmitOnEnter } from "../hooks/useSubmitOnEnter";

interface AddTaskModalProps {
  isOpen: boolean;
  columnLabel?: string;
  onClose: () => void;
  onAdd: (title: string, description: string) => Promise<void>;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  columnLabel,
  onClose,
  onAdd,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setDescription("");
      setError(null);
      setSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (isSubmitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await onAdd(title.trim(), description.trim());
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add task";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }, [description, isSubmitting, onAdd, onClose, title]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSubmit();
  };

  useSubmitOnEnter(isOpen, handleSubmit, { disabled: isSubmitting });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-6 rounded-xl w-96 shadow-lg">
        <h2 className="text-xl font-semibold mb-2 text-center">Add new task</h2>
        {columnLabel && (
          <p className="text-center text-sm text-zinc-400 mb-4">
            Column:{" "}
            <span className="text-blue-300 font-medium">{columnLabel}</span>
          </p>
        )}
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
              autoFocus={true}
            />
          </div>
          <div>
            <textarea
              placeholder="Task description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded bg-zinc-700 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="bg-zinc-600 hover:bg-zinc-500 px-3 py-1 rounded disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
