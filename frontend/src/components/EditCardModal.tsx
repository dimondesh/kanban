import { useCallback, useEffect, useState } from "react";
import type { Card } from "../types";
import { useSubmitOnEnter } from "../hooks/useSubmitOnEnter";

interface EditCardModalProps {
  isOpen: boolean;
  card?: Card;
  columnLabel?: string;
  onClose: () => void;
  onSave: (title: string, description: string) => Promise<void>;
}

export const EditCardModal: React.FC<EditCardModalProps> = ({
  isOpen,
  card,
  columnLabel,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(card?.title ?? "");
  const [description, setDescription] = useState(card?.description ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const canSubmitOnEnter = isOpen && Boolean(card);

  useEffect(() => {
    if (isOpen && card) {
      setTitle(card.title);
      setDescription(card.description ?? "");
      setError(null);
      setSubmitting(false);
    }

    if (!isOpen) {
      setTitle("");
      setDescription("");
      setError(null);
      setSubmitting(false);
    }
  }, [isOpen, card]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (isSubmitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await onSave(title.trim(), description);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update task";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }, [description, isSubmitting, onClose, onSave, title]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSubmit();
  };

  useSubmitOnEnter(canSubmitOnEnter, handleSubmit, { disabled: isSubmitting });

  if (!isOpen || !card) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-6 rounded-xl w-96 shadow-lg">
        <h2 className="text-xl font-semibold mb-2 text-center">Edit task</h2>
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
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
