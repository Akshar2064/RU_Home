import { Phone, MapPin, Clock, Badge as BadgeIcon, LogOut, ChevronRight, Bell, ShieldQuestion } from "lucide-react";
import { Card, Avatar, Button } from "../ui.jsx";
import { GUARD, COMMUNITY } from "../mockData.js";

export default function Profile({ gate, onLogout, profile = GUARD, roleLabel = "Security" }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center text-center py-4">
        <Avatar initials={profile.photoInitials} size={72} tone="navy" />
        <p className="text-lg font-bold mt-3">{profile.name}</p>
        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{COMMUNITY} {roleLabel}</p>
      </div>

      <Card className="divide-y" style={{ borderColor: "var(--color-border)" }}>
        <InfoRow icon={BadgeIcon} label="Employee ID" value={profile.employeeId} />
        <InfoRow icon={Phone} label="Contact" value={profile.phone} />
        <InfoRow icon={MapPin} label="Assigned gate" value={gate} />
        <InfoRow icon={Clock} label="Shift" value={`${profile.shiftLabel} · ${profile.shiftWindow}`} />
      </Card>

      <Card>
        <MenuRow icon={Bell} label="Notification preferences" />
        <MenuRow icon={ShieldQuestion} label="Help & support" />
      </Card>

      <Button variant="danger" full size="lg" icon={LogOut} onClick={onLogout}>Log Out</Button>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderColor: "var(--color-border)" }}>
      <Icon size={16} style={{ color: "var(--color-text-tertiary)" }} />
      <div className="flex-1">
        <p className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function MenuRow({ icon: Icon, label }) {
  return (
    <button className="w-full flex items-center gap-3 px-4 py-3.5" style={{ borderColor: "var(--color-border)" }}>
      <Icon size={16} style={{ color: "var(--color-text-secondary)" }} />
      <span className="flex-1 text-left text-sm font-semibold">{label}</span>
      <ChevronRight size={16} style={{ color: "var(--color-text-tertiary)" }} />
    </button>
  );
}
