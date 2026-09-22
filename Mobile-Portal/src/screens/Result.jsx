import { Button, Card } from "../ui.jsx";

/* Generic success / confirmation screen reused across every flow:
   entry recorded, resident notified, exit recorded, incident submitted,
   checkpoint completed, handover completed, worker verified, etc. */
export default function ResultScreen({
  tone = "success",
  icon: Icon,
  title,
  body,
  details = [],
  primaryLabel = "Done",
  onPrimary,
  secondaryLabel,
  onSecondary,
}) {
  const bg = tone === "success" ? "var(--color-success-bg)" : tone === "danger" ? "var(--color-danger-bg)" : "var(--color-info-bg)";
  const fg = tone === "success" ? "var(--color-success)" : tone === "danger" ? "var(--color-danger)" : "var(--color-info)";

  return (
    <div className="flex flex-col items-center text-center py-6">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: bg }}>
        <Icon size={38} style={{ color: fg }} />
      </div>
      <h2 className="text-xl font-bold mb-1.5">{title}</h2>
      {body && <p className="text-sm max-w-xs mb-5" style={{ color: "var(--color-text-secondary)" }}>{body}</p>}

      {details.length > 0 && (
        <Card className="w-full p-4 text-left mb-5">
          {details.map((d, i) => (
            <div key={i} className={`flex items-center justify-between text-xs ${i > 0 ? "mt-2.5 pt-2.5" : ""}`} style={i > 0 ? { borderTop: "1px dashed var(--color-border)" } : {}}>
              <span style={{ color: "var(--color-text-tertiary)" }}>{d.label}</span>
              <span className="font-bold">{d.value}</span>
            </div>
          ))}
        </Card>
      )}

      <div className="w-full flex flex-col gap-2.5">
        {onPrimary && <Button variant="primary" full size="lg" onClick={onPrimary}>{primaryLabel}</Button>}
        {onSecondary && <Button variant="ghost" full onClick={onSecondary}>{secondaryLabel}</Button>}
      </div>
    </div>
  );
}
