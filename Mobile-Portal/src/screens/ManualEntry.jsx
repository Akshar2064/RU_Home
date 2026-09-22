import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button, Card, Field, Input, TextArea } from "../ui.jsx";

const VISITOR_TYPES = ["Guest", "Delivery", "Cab / Taxi", "Vendor", "Other"];
const DURATIONS = ["Under 30 min", "30–60 min", "1–2 hours", "Half day", "Full day"];

export default function ManualEntry({ onRegister }) {
  const [form, setForm] = useState({
    name: "", phone: "", purpose: "", flat: "", vehicle: "", type: "Guest", duration: DURATIONS[0],
  });
  const [errors, setErrors] = useState({});

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit() {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Visitor name is required";
    if (!form.phone.trim()) nextErrors.phone = "Mobile number is required";
    if (!form.flat.trim()) nextErrors.flat = "Resident / flat is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onRegister(form);
  }

  return (
    <div className="space-y-5">
      <Card className="p-5 space-y-4">
        <Field label="Visitor name" error={errors.name}>
          <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Full name" />
        </Field>
        <Field label="Mobile number" error={errors.phone}>
          <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98xxxxxxx" inputMode="tel" />
        </Field>
        <Field label="Resident / Flat" error={errors.flat}>
          <Input value={form.flat} onChange={(e) => update("flat", e.target.value)} placeholder="e.g. B-1204 or resident name" />
        </Field>
        <Field label="Purpose of visit">
          <TextArea rows={2} value={form.purpose} onChange={(e) => update("purpose", e.target.value)} placeholder="Personal visit, delivery, service call…" />
        </Field>
        <Field label="Vehicle number (optional)">
          <Input value={form.vehicle} onChange={(e) => update("vehicle", e.target.value.toUpperCase())} placeholder="TS09AB1234" />
        </Field>
        <Field label="Visitor type">
          <div className="grid grid-cols-3 gap-2">
            {VISITOR_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => update("type", t)}
                className={`text-xs font-semibold rounded-lg px-2 py-2.5 border transition ${form.type === t ? "text-white" : ""}`}
                style={form.type === t ? { background: "var(--color-navy-800)", borderColor: "var(--color-navy-800)" } : { borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Expected duration">
          <select
            value={form.duration}
            onChange={(e) => update("duration", e.target.value)}
            className="w-full rounded-xl px-3.5 py-3 text-sm outline-none"
            style={{ border: "1px solid var(--color-border)" }}
          >
            {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
      </Card>
      <Button variant="primary" full size="lg" icon={UserPlus} onClick={submit}>
        Verify &amp; Register Visitor
      </Button>
    </div>
  );
}
