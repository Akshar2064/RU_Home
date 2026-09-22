import { useState } from "react";
import { ShieldCheck, Building2, KeyRound, ChevronDown, MapPin } from "lucide-react";
import { Button, Input, Field, inputStyle } from "../ui.jsx";
import { COMMUNITY, GATES, GUARD } from "../mockData.js";

export default function Login({ onLogin }) {
  const [step, setStep] = useState("id"); // id -> otp -> gate
  const [employeeId, setEmployeeId] = useState("");
  const [otp, setOtp] = useState("");
  const [gate, setGate] = useState(GATES[0]);
  const [error, setError] = useState("");

  function submitId(e) {
    e.preventDefault();
    if (!employeeId.trim()) {
      setError("Enter your mobile number or employee ID");
      return;
    }
    setError("");
    setStep("otp");
  }

  function submitOtp(e) {
    e.preventDefault();
    if (otp.trim().length < 4) {
      setError("Enter the 6-digit code (demo: any 4+ digits)");
      return;
    }
    setError("");
    setStep("gate");
  }

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center px-5 py-10" style={{ background: "var(--color-navy-900)" }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--color-marigold-500)" }}>
            <ShieldCheck size={30} style={{ color: "var(--color-navy-900)" }} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-marigold-500)" }}>Security / Guard Access</p>
          <h1 className="text-2xl font-bold text-white mt-2">{COMMUNITY}</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>Guard App — gate operations</p>
        </div>

        <div className="rounded-3xl p-6" style={{ background: "var(--color-navy-800)" }}>
          {step === "id" && (
            <form onSubmit={submitId} className="space-y-5">
              <Field label="Mobile number / Employee ID" error={error}>
                <input
                  autoFocus
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="GRD-1042 or +91 98450 55210"
                  className="w-full rounded-xl px-3.5 py-3.5 text-sm outline-none bg-white/10 text-white placeholder-white/40 border border-white/15"
                />
              </Field>
              <Button type="submit" full size="lg" variant="accent">Continue</Button>
              <p className="text-[11px] text-center" style={{ color: "rgba(255,255,255,0.45)" }}>Demo credentials — any value works.</p>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={submitOtp} className="space-y-5">
              <div className="flex items-center gap-2 mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                <KeyRound size={16} />
                <span className="text-xs">Verifying {employeeId}</span>
              </div>
              <Field label="Enter OTP / PIN" error={error} hint="Demo: enter any 4+ digits">
                <input
                  autoFocus
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  maxLength={6}
                  className="w-full rounded-xl px-3.5 py-3.5 text-center text-2xl tracking-[0.5em] outline-none bg-white/10 text-white placeholder-white/30 border border-white/15"
                />
              </Field>
              <Button type="submit" full size="lg" variant="accent">Verify</Button>
              <button type="button" onClick={() => setStep("id")} className="w-full text-center text-xs font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
                Change ID
              </button>
            </form>
          )}

          {step === "gate" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "var(--color-marigold-500)", color: "var(--color-navy-900)" }}>
                  {GUARD.photoInitials}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{GUARD.name}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{GUARD.employeeId}</p>
                </div>
              </div>
              <Field label="Confirm your gate for this shift">
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.5)" }} />
                  <select
                    value={gate}
                    onChange={(e) => setGate(e.target.value)}
                    className="w-full appearance-none rounded-xl pl-10 pr-9 py-3.5 text-sm outline-none bg-white/10 text-white border border-white/15"
                  >
                    {GATES.map((g) => (
                      <option key={g} value={g} style={{ color: "#111" }}>{g}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.5)" }} />
                </div>
              </Field>
              <Button onClick={() => onLogin(gate)} full size="lg" variant="accent">
                Start Shift at {gate}
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mt-6" style={{ color: "rgba(255,255,255,0.35)" }}>
          <Building2 size={14} />
          <span className="text-[11px]">RUhome Security Operations</span>
        </div>
      </div>
    </div>
  );
}
