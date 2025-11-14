import { useEffect } from "react";

interface SubmitOnEnterOptions {
  disabled?: boolean;
}

export const useSubmitOnEnter = (
  isActive: boolean,
  onSubmit: () => void | Promise<void>,
  { disabled = false }: SubmitOnEnterOptions = {}
) => {
  useEffect(() => {
    if (!isActive || disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key !== "Enter" ||
        event.shiftKey ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.isComposing
      ) {
        return;
      }

      event.preventDefault();
      void onSubmit();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, disabled, onSubmit]);
};
