import { useState } from "react";
import {
  QrCode, ScanLine, CheckCircle2, XCircle, Clock, Ban, HelpCircle,
  Car, Users as UsersIcon, MapPin, Building2, KeyRound, Keyboard,
} from "lucide-react";
import { Button, Card, Badge, Avatar } from "../ui.jsx";
import { QR_SAMPLES } from "../mockData.js";

/* ---------------------------------------------------------------------------
   SCAN QR — camera viewfinder is simulated (no real camera access). The guard
   taps one of the "simulate scan" outcomes to demo each verification state.
   --------------------------------------------------------------------------- */
export function ScanQR({ onScanned, onManualEntry }) {
  const [scanning, setScanning] = useState(false);

  function simulate(key) {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      onScanned(key);
    }, 550);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl overflow-hidden relative" style={{ background: "var(--color-navy-900)", aspectRatio: "1 / 1" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-52 h-52 rounded-3xl relative">
            {["top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl", "top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl", "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl", "bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl"].map((cls, i) => (
              <div key={i} className={`absolute w-10 h-10 ${cls}`} style={{ borderColor: "var(--color-marigold-500)" }} />
            ))}
            {scanning && (
              <div className="absolute left-0 right-0 h-0.5 guard-pulse" style={{ top: "50%", background: "var(--color-marigold-500)" }} />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <QrCode size={64} strokeWidth={1} color="rgba(255,255,255,0.25)" />
            </div>
          </div>
        </div>
        <p className="absolute bottom-4 left-0 right-0 text-center text-xs font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
          {scanning ? "Reading QR code…" : "Point camera at the visitor's QR pass"}
        </p>
      </div>

      <Card className="p-4">
        <p className="text-xs font-bold mb-3" style={{ color: "var(--color-text-tertiary)" }}>
          DEMO CONTROLS · simulate a scanned pass
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="success" size="sm" icon={CheckCircle2} onClick={() => simulate("valid")}>Valid pass</Button>
          <Button variant="secondary" size="sm" icon={Clock} onClick={() => simulate("expired")}>Expired</Button>
          <Button variant="secondary" size="sm" icon={ScanLine} onClick={() => simulate("used")}>Already used</Button>
          <Button variant="secondary" size="sm" icon={Ban} onClick={() => simulate("revoked")}>Revoked</Button>
          <Button variant="danger" size="sm" icon={XCircle} className="col-span-2" onClick={() => simulate("invalid")}>Invalid / unreadable QR</Button>
        </div>
      </Card>

      <Button variant="ghost" full icon={Keyboard} onClick={onManualEntry}>
        Can't scan? Verify with OTP or manual entry
      </Button>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   VISITOR VERIFY — the result screen shown after a QR scan (or OTP check).
   --------------------------------------------------------------------------- */
const STATUS_META = {
  VALID: { label: "Valid Pass", tone: "success", icon: CheckCircle2 },
  EXPIRED: { label: "Pass Expired", tone: "warning", icon: Clock },
  ALREADY_USED: { label: "Already Used", tone: "warning", icon: ScanLine },
  REVOKED: { label: "Revoked by Resident", tone: "danger", icon: Ban },
  INVALID: { label: "Invalid QR Code", tone: "danger", icon: HelpCircle },
};

export function VisitorVerify({ resultKey, onApprove, onDeny, onOtpFallback, onManualFallback, onRescan }) {
  const data = QR_SAMPLES[resultKey] || QR_SAMPLES.invalid;
  const meta = STATUS_META[data.status] || STATUS_META.INVALID;
  const Icon = meta.icon;
  const isValid = data.status === "VALID";

  return (
    <div className="space-y-5">
      <div
        className="rounded-2xl p-4 flex items-center gap-3"
        style={{ background: meta.tone === "success" ? "var(--color-success-bg)" : meta.tone === "warning" ? "var(--color-warning-bg)" : "var(--color-danger-bg)" }}
      >
        <Icon size={26} style={{ color: `var(--color-${meta.tone})` }} />
        <div>
          <p className="text-sm font-bold" style={{ color: `var(--color-${meta.tone})` }}>{meta.label}</p>
          {data.passId && <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>Pass ID {data.passId}</p>}
        </div>
      </div>

      {data.status === "INVALID" && (
        <Card className="p-5 text-center">
          <p className="text-sm font-semibold mb-1">This QR code could not be verified</p>
          <p className="text-xs mb-4" style={{ color: "var(--color-text-secondary)" }}>
            It may be damaged, from a different community, or not a RUhome visitor pass.
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="primary" full onClick={onRescan}>Scan again</Button>
            <Button variant="secondary" full icon={KeyRound} onClick={onOtpFallback}>Verify with OTP instead</Button>
            <Button variant="ghost" full onClick={onManualFallback}>Register visitor manually</Button>
          </div>
        </Card>
      )}

      {data.status === "REVOKED" && (
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Avatar initials={data.name.slice(0, 2).toUpperCase()} tone="navy" />
            <div>
              <p className="text-sm font-bold">{data.name}</p>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{data.resident} · {data.flat}</p>
            </div>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--color-text-secondary)" }}>
            Reason: {data.revokedReason}. This visitor cannot be admitted on this pass — contact the resident if the visit is still expected.
          </p>
          <Button variant="danger" full onClick={onDeny}>Deny entry</Button>
        </Card>
      )}

      {data.status === "ALREADY_USED" && (
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Avatar initials={data.name.slice(0, 2).toUpperCase()} tone="navy" />
            <div>
              <p className="text-sm font-bold">{data.name}</p>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{data.resident} · {data.flat}</p>
            </div>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--color-text-secondary)" }}>
            This pass was already used for entry at {data.usedAt}. If the visitor is re-entering, verify manually or ask the resident to issue a new pass.
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" full icon={KeyRound} onClick={onOtpFallback}>Verify with OTP</Button>
            <Button variant="ghost" full onClick={onManualFallback}>Register as new manual entry</Button>
          </div>
        </Card>
      )}

      {data.status === "EXPIRED" && (
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Avatar initials={data.name.slice(0, 2).toUpperCase()} tone="navy" />
            <div>
              <p className="text-sm font-bold">{data.name}</p>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{data.resident} · {data.flat}</p>
            </div>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--color-text-secondary)" }}>
            This pass's time window ({data.window}) has passed. Verify identity another way before allowing entry.
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" full icon={KeyRound} onClick={onOtpFallback}>Verify with OTP</Button>
            <Button variant="ghost" full onClick={onManualFallback}>Register manually</Button>
          </div>
        </Card>
      )}

      {isValid && (
        <>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <Avatar initials={data.name.slice(0, 2).toUpperCase()} tone="navy" size={48} />
              <div className="flex-1">
                <p className="text-base font-bold">{data.name}</p>
                <Badge tone="info" size="sm">{data.type}</Badge>
              </div>
            </div>
            <div className="space-y-2.5 text-xs">
              <Row icon={Building2} label="Visiting" value={`${data.resident} · ${data.flat}`} />
              <Row icon={MapPin} label="Tower" value={data.tower} />
              <Row icon={Clock} label="Time window" value={data.window} />
              <Row icon={UsersIcon} label="Purpose" value={data.purpose} />
              {data.vehicle !== "—" && <Row icon={Car} label="Vehicle" value={data.vehicle} />}
              <Row icon={UsersIcon} label="Accompanying" value={`${data.people} ${data.people > 1 ? "people" : "person"}`} />
            </div>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="danger" size="lg" onClick={onDeny}>Deny</Button>
            <Button variant="success" size="lg" onClick={onApprove}>Approve Entry</Button>
          </div>
        </>
      )}
    </div>
  );
}

export function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={15} style={{ color: "var(--color-text-tertiary)" }} />
      <span style={{ color: "var(--color-text-tertiary)" }} className="w-24 shrink-0">{label}</span>
      <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{value}</span>
    </div>
  );
}
