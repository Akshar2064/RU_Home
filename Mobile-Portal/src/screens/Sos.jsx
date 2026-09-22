import { ShieldAlert, X, Phone, MapPin } from "lucide-react";
import { Button, Card } from "../ui.jsx";
import { GUARD } from "../mockData.js";

export default function Sos({ state, onConfirm, onCancel, onEnd }) {
  if (state === "active") {
    return (
      <div className="min-h-[92vh] -mx-4 -mt-6 px-6 py-10 flex flex-col" style={{ background: "var(--color-danger-strong)" }}>
        <button onClick={onEnd} className="w-10 h-10 rounded-full flex items-center justify-center self-start" style={{ background: "rgba(255,255,255,0.15)" }}>
          <X size={20} color="#fff" />
        </button>
        <div className="flex-1 flex flex-col items-center text-center justify-center text-white">
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-6">
            <ShieldAlert size={44} style={{ color: "var(--color-danger-strong)" }} />
          </div>
          <h1 className="text-2xl font-bold mb-3">Emergency Alert Active</h1>
          <p className="text-sm max-w-xs opacity-90 mb-8">
            Control room and RWA security desk have been notified from {GUARD.gate}. Backup is being dispatched.
          </p>
          <Card className="w-full p-4 text-left" style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                <Phone size={16} color="#fff" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Control Room · +91 22 4890 1100</p>
                <p className="text-[11px] text-white/70">Connected · response ETA 2 min</p>
              </div>
            </div>
          </Card>
          <Button variant="secondary" full size="lg" className="mt-8" onClick={onEnd}>
            Situation resolved · End alert
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center py-6">
      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: "var(--color-danger-bg)" }}>
        <ShieldAlert size={44} style={{ color: "var(--color-danger)" }} />
      </div>
      <h1 className="text-xl font-bold mb-2">Trigger Emergency Alert?</h1>
      <p className="text-sm max-w-xs mb-6" style={{ color: "var(--color-text-secondary)" }}>
        This immediately notifies the control room and nearby guards of an emergency at {GUARD.gate}. Use only for a genuine security or safety emergency.
      </p>
      <Card className="w-full p-4 text-left mb-6">
        <div className="flex items-center gap-2.5">
          <MapPin size={16} style={{ color: "var(--color-danger)" }} />
          <div>
            <p className="text-xs font-bold">Alert location</p>
            <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>{GUARD.gate} · RUhome</p>
          </div>
        </div>
      </Card>
      <div className="w-full flex flex-col gap-2.5">
        <Button variant="danger" full size="xl" onClick={onConfirm}>Confirm Emergency</Button>
        <Button variant="ghost" full onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
