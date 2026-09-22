import { X, Loader2, Inbox } from "lucide-react";

/* ============================================================================
   SHARED UI PRIMITIVES
   Same design language as the Resident applications (navy / marigold tokens,
   Inter, rounded-2xl cards, 8px spacing) adapted for large-touch-target,
   high-contrast gate operations.
   ============================================================================ */

export function Button({
  children,
  variant = "primary",
  size = "md",
  full,
  disabled,
  loading,
  icon: Icon,
  className = "",
  ...rest
}) {
  const variants = {
    primary: { background: "var(--color-navy-800)", color: "#fff", border: "1px solid var(--color-navy-800)" },
    accent: { background: "var(--color-marigold-500)", color: "var(--color-navy-900)", border: "1px solid var(--color-marigold-500)" },
    secondary: { background: "#fff", color: "var(--color-text-primary)", border: "1px solid var(--color-border)" },
    danger: { background: "var(--color-danger)", color: "#fff", border: "1px solid var(--color-danger)" },
    ghost: { background: "transparent", color: "var(--color-text-secondary)", border: "1px solid transparent" },
    success: { background: "var(--color-success)", color: "#fff", border: "1px solid var(--color-success)" },
  };
  const sizes = {
    sm: "text-xs px-3 py-2 rounded-lg gap-1.5",
    md: "text-sm px-4 py-3 rounded-xl gap-2",
    lg: "text-base px-5 py-4 rounded-2xl gap-2.5",
    xl: "text-lg px-6 py-5 rounded-2xl gap-3",
  };
  return (
    <button
      disabled={disabled || loading}
      className={`guard-focus font-semibold inline-flex items-center justify-center active:scale-[.98] transition disabled:opacity-50 disabled:active:scale-100 ${sizes[size]} ${full ? "w-full" : ""} ${className}`}
      style={variants[variant]}
      {...rest}
    >
      {loading ? <Loader2 size={size === "xl" ? 22 : 16} className="guard-spin" /> : Icon ? <Icon size={size === "xl" ? 22 : size === "lg" ? 20 : 16} /> : null}
      {children}
    </button>
  );
}

export function Card({ children, className = "", style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-white shadow-sm ${onClick ? "cursor-pointer active:scale-[.99] transition" : ""} ${className}`}
      style={{ border: "1px solid var(--color-border)", ...style }}
    >
      {children}
    </div>
  );
}

const TONE_STYLES = {
  neutral: { fg: "var(--color-text-secondary)", bg: "#EEF0F4" },
  success: { fg: "var(--color-success)", bg: "var(--color-success-bg)" },
  warning: { fg: "var(--color-warning)", bg: "var(--color-warning-bg)" },
  danger: { fg: "var(--color-danger)", bg: "var(--color-danger-bg)" },
  info: { fg: "var(--color-info)", bg: "var(--color-info-bg)" },
};

export function Badge({ children, tone = "neutral", size = "md" }) {
  const s = TONE_STYLES[tone] || TONE_STYLES.neutral;
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"}`}
      style={{ color: s.fg, background: s.bg }}
    >
      {children}
    </span>
  );
}

export function Avatar({ initials, size = 40, tone = "navy" }) {
  const bg = tone === "navy" ? "var(--color-navy-800)" : tone === "marigold" ? "var(--color-marigold-500)" : "var(--color-navy-50)";
  const fg = tone === "marigold" ? "var(--color-navy-900)" : "#fff";
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold shrink-0"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

export function SectionTitle({ title, subtitle, action, onAction }) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: "var(--color-text-tertiary)", letterSpacing: "0.04em" }}>{title}</h2>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{subtitle}</p>}
      </div>
      {action && (
        <button onClick={onAction} className="guard-focus text-xs font-bold" style={{ color: "var(--color-navy-700)" }}>
          {action}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, body }) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--color-navy-50)" }}>
        <Icon size={28} strokeWidth={1.75} style={{ color: "var(--color-navy-700)" }} />
      </div>
      <p className="font-bold text-sm mb-1" style={{ color: "var(--color-text-primary)" }}>{title}</p>
      <p className="text-xs max-w-xs" style={{ color: "var(--color-text-secondary)" }}>{body}</p>
    </div>
  );
}

export function Spinner({ size = 20, color = "var(--color-navy-800)" }) {
  return <Loader2 size={size} className="guard-spin" style={{ color }} />;
}

export function Modal({ open, onClose, title, subtitle, children, footer, tone }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl guard-slide-up max-h-[88vh] overflow-y-auto">
        <div className="flex items-start justify-between px-6 pt-5 pb-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <div>
            <h3 className="text-base font-bold" style={{ color: tone === "danger" ? "var(--color-danger)" : "var(--color-text-primary)" }}>{title}</h3>
            {subtitle && <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{subtitle}</p>}
          </div>
          {onClose && (
            <button onClick={onClose} className="guard-focus shrink-0 rounded-full p-1" style={{ color: "var(--color-text-secondary)" }}>
              <X size={20} />
            </button>
          )}
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="px-6 py-4 flex items-center gap-3" style={{ borderTop: "1px solid var(--color-border)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  return (
    <div className="fixed left-1/2 top-4 z-[60] -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm">
      <div
        className="rounded-2xl px-4 py-3 flex items-start gap-2.5 shadow-lg guard-slide-up"
        style={{
          background: toast.tone === "danger" ? "var(--color-danger)" : toast.tone === "warning" ? "var(--color-warning)" : "var(--color-navy-900)",
          color: "#fff",
        }}
      >
        <div className="flex-1">
          <p className="text-sm font-bold">{toast.title}</p>
          {toast.body && <p className="text-xs mt-0.5 opacity-90">{toast.body}</p>}
        </div>
        <button onClick={onDismiss} className="shrink-0 opacity-80">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export const inputStyle = {
  border: "1px solid var(--color-border)",
  background: "#fff",
};

export function Field({ label, hint, error, children }) {
  return (
    <div>
      {label && <label className="text-xs font-bold block mb-1.5" style={{ color: "var(--color-text-secondary)" }}>{label}</label>}
      {children}
      {hint && !error && <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>{hint}</p>}
      {error && <p className="text-xs mt-1 font-medium" style={{ color: "var(--color-danger)" }}>{error}</p>}
    </div>
  );
}

export function Input(props) {
  return (
    <input
      className="w-full rounded-xl px-3.5 py-3 text-sm outline-none guard-focus"
      style={inputStyle}
      {...props}
    />
  );
}

export function TextArea(props) {
  return (
    <textarea
      className="w-full rounded-xl px-3.5 py-3 text-sm outline-none guard-focus resize-none"
      style={inputStyle}
      {...props}
    />
  );
}
