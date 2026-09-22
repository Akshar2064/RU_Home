import { Bell, AlertTriangle, Info, Clock } from "lucide-react";
import { Card, EmptyState } from "../ui.jsx";

const TONE_BG = {
  info: "var(--color-info-bg)", warning: "var(--color-warning-bg)", danger: "var(--color-danger-bg)", neutral: "#EEF0F4",
};
const TONE_FG = {
  info: "var(--color-info)", warning: "var(--color-warning)", danger: "var(--color-danger)", neutral: "var(--color-text-secondary)",
};
const TONE_ICON = { info: Info, warning: AlertTriangle, danger: AlertTriangle, neutral: Clock };

export default function Notifications({ notifications, onMarkAllRead }) {
  if (notifications.length === 0) {
    return <EmptyState icon={Bell} title="No notifications" body="Security alerts and visitor updates will show up here." />;
  }
  return (
    <div className="space-y-4">
      <button onClick={onMarkAllRead} className="text-xs font-bold" style={{ color: "var(--color-navy-700)" }}>Mark all as read</button>
      <div className="space-y-2">
        {notifications.map((n) => {
          const Icon = TONE_ICON[n.tone];
          return (
            <Card key={n.id} className="p-4 flex gap-3" style={{ background: n.read ? "#fff" : "var(--color-navy-50)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: TONE_BG[n.tone] }}>
                <Icon size={16} style={{ color: TONE_FG[n.tone] }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold">{n.title}</p>
                <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{n.body}</p>
                <p className="text-[10px] mt-1.5" style={{ color: "var(--color-text-tertiary)" }}>{n.time}</p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: "var(--color-marigold-500)" }} />}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
