import { useState } from "react";
import { KeyRound, CheckCircle2, XCircle, Clock, ScanLine, Building2, Car, Users as UsersIcon } from "lucide-react";
import { Button, Card, Badge, Field, Input, Avatar } from "../ui.jsx";
import { Row } from "./Scan.jsx";
import { OTP_SAMPLES } from "../mockData.js";

export function OtpEntry({ onVerified }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [checking, setChecking] = useState(false);

  function verify() {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      // Demo logic: OTP determines the outcome so every state is reachable.
      let outcome = "valid";
      if (otp === "0000") outcome = "invalid";
      else if (otp === "1111") outcome = "expired";
      else if (otp === "2222") outcome = "used";
      onVerified(outcome);
    }, 500);
  }

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <Field label="Visitor mobile number">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98xxxxxxx" inputMode="tel" />
        </Field>
        <div className="mt-4">
          <Field label="Enter 6-digit OTP shared by the visitor" hint="Demo: 0000 invalid · 1111 expired · 2222 already used · anything else valid">
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              inputMode="numeric"
              className="text-center text-xl tracking-[0.4em]"
            />
          </Field>
        </div>
      </Card>
      <Button variant="primary" full size="lg" icon={KeyRound} loading={checking} disabled={otp.length < 4} onClick={verify}>
        Verify OTP
      </Button>
    </div>
  );
}

const OUTCOME_META = {
  VALID: { label: "OTP Verified", tone: "success", icon: CheckCircle2 },
  INVALID: { label: "Incorrect OTP", tone: "danger", icon: XCircle },
  EXPIRED: { label: "OTP Expired", tone: "warning", icon: Clock },
  ALREADY_USED: { label: "OTP Already Used", tone: "warning", icon: ScanLine },
};

export function OtpResult({ outcomeKey, onApprove, onDeny, onRetry, onManualFallback }) {
  const data = OTP_SAMPLES[outcomeKey] || OTP_SAMPLES.invalid;
  const meta = OUTCOME_META[data.outcome];
  const Icon = meta.icon;
  const isValid = data.outcome === "VALID";

  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: meta.tone === "success" ? "var(--color-success-bg)" : meta.tone === "warning" ? "var(--color-warning-bg)" : "var(--color-danger-bg)" }}>
        <Icon size={26} style={{ color: `var(--color-${meta.tone})` }} />
        <p className="text-sm font-bold" style={{ color: `var(--color-${meta.tone})` }}>{meta.label}</p>
      </div>

      {!isValid && (
        <Card className="p-5">
          {data.name && (
            <p className="text-xs mb-3" style={{ color: "var(--color-text-secondary)" }}>
              Matched to <b>{data.name}</b> · {data.flat}
              {data.usedAt && <> · used at {data.usedAt}</>}
            </p>
          )}
          <div className="flex flex-col gap-2">
            <Button variant="primary" full onClick={onRetry}>Try again</Button>
            <Button variant="ghost" full onClick={onManualFallback}>Register manually instead</Button>
          </div>
        </Card>
      )}

      {isValid && (
        <>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <Avatar initials={data.name.slice(0, 2).toUpperCase()} tone="navy" size={48} />
              <div>
                <p className="text-base font-bold">{data.name}</p>
                <Badge tone="info" size="sm">{data.type}</Badge>
              </div>
            </div>
            <div className="space-y-2.5 text-xs">
              <Row icon={Building2} label="Visiting" value={`${data.resident} · ${data.flat}`} />
              <Row icon={UsersIcon} label="Purpose" value={data.purpose} />
              {data.vehicle && data.vehicle !== "—" && <Row icon={Car} label="Vehicle" value={data.vehicle} />}
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
