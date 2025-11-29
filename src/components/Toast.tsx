import { createSignal, onMount, onCleanup } from "solid-js";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  offsetTop?: number;
}

export function Toast(props: ToastProps) {
  const [isVisible, setIsVisible] = createSignal(true);
  const duration = props.duration ?? 3000;
  const type = props.type ?? "info";
  const offsetTop = props.offsetTop ?? 0;

  let timeoutId: number;

  onMount(() => {
    // Auto-dismiss after duration
    timeoutId = window.setTimeout(() => {
      setIsVisible(false);
      // Wait for animation to complete before calling onClose
      setTimeout(() => props.onClose(), 300);
    }, duration);
  });

  onCleanup(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => props.onClose(), 300);
  };

  const typeColors = {
    success: { bg: "#10b981", border: "#059669" },
    error: { bg: "#ef4444", border: "#dc2626" },
    warning: { bg: "#f59e0b", border: "#d97706" },
    info: { bg: "#3b82f6", border: "#2563eb" },
  };

  const colors = typeColors[type];

  return (
    <div
      style={{
        position: "fixed",
        top: `${1 + offsetTop}rem`,
        right: "1rem",
        "z-index": "1000",
        "min-width": "300px",
        "max-width": "500px",
        "border-radius": "8px",
        border: `2px solid ${colors.border}`,
        padding: "1rem",
        "background-color": colors.bg,
        "box-shadow": "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
        transition: "all 0.3s ease",
        opacity: isVisible() ? 1 : 0,
        transform: isVisible() ? "translateX(0)" : "translateX(100%)",
      }}
    >
      <div style={{ display: "flex", "align-items": "flex-start", "justify-content": "space-between", gap: "0.75rem" }}>
        <div style={{ flex: 1, color: "white", "font-weight": "500" }}>{props.message}</div>
        <button
          onClick={handleClose}
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            padding: "0",
            display: "flex",
            "align-items": "center",
            "flex-shrink": "0",
          }}
          aria-label="Close notification"
        >
          <svg
            style={{ width: "20px", height: "20px" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

export function ToastContainer(props: { toasts: ToastMessage[]; onRemove: (id: number) => void }) {
  return (
    <>
      {props.toasts.map((toast, index) => (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          offsetTop={index * 5}
          onClose={() => props.onRemove(toast.id)}
        />
      ))}
    </>
  );
}
