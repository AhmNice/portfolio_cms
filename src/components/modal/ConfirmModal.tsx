import { useEffect, useRef } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Escape to close, and lock body scroll while open.
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    confirmButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, isLoading, onCancel]);

  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => !isLoading && onCancel()}
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm rounded-2xl border border-outline-variant/10 bg-surface-container shadow-2xl p-6">
        <button
          onClick={onCancel}
          disabled={isLoading}
          aria-label="Close"
          className="absolute right-4 top-4 text-on-surface-variant/50 hover:text-on-surface transition-colors disabled:opacity-50"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-3">
          {isDanger && (
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
          )}
          <div className="pt-0.5">
            <h2
              id="confirm-modal-title"
              className="font-heading text-lg font-semibold text-on-surface"
            >
              {title}
            </h2>
            {description && (
              <p className="font-body text-body-sm text-on-surface-variant mt-1.5 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg font-body text-sm font-medium text-on-surface-variant hover:bg-surface-container-high/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-body text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isDanger
                ? "bg-red-500 text-white hover:bg-red-500/90"
                : "bg-primary text-on-primary hover:bg-primary/90"
            }`}
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;