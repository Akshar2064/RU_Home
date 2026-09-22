import { useState } from "react";
import { Car, CheckCircle2, XCircle, HelpCircle, ScanLine } from "lucide-react";
import { Button, Card } from "../ui.jsx";
import { Row } from "./Scan.jsx";
import { ANPR_SAMPLES } from "../mockData.js";

const RESULT_META = {
  MATCHED: { label: "Vehicle Matched", tone: "success", icon: CheckCircle2 },
  UNMATCHED: { label: "Not an Expected Visitor", tone: "warning", icon: HelpCircle },
  UNKNOWN: { label: "Unrecognized Vehicle", tone: "danger", icon: XCircle },
};

export default function VehicleCheck({ onManualVerify }) {
  const [resultKey, setResultKey] = useState(null);
  const data = resultKey ? ANPR_SAMPLES[resultKey] : null;
  const meta = data ? RESULT_META[data.result] : null;

  return (
    <div className="space-y-5">
      <div className="rounded-3xl overflow-hidden relative flex items-center justify-center" style={{ background: "var(--color-navy-900)", height: 180 }}>
        <ScanLine size={40} color="rgba(255,255,255,0.35)" />
        <p className="absolute bottom-3 left-0 right-0 text-center text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
          Simulated ANPR camera feed — number plate recognition
        </p>
      </div>

      <Card className="p-4">
        <p className="text-xs font-bold mb-3" style={{ color: "var(--color-text-tertiary)" }}>DEMO CONTROLS · simulate a detected plate</p>
        <div className="grid grid-cols-1 gap-2">
          <Button variant="success" size="sm" icon={Car} onClick={() => setResultKey("matched")}>
            {ANPR_SAMPLES.matched.plate} — expected visitor
          </Button>
          <Button variant="secondary" size="sm" icon={Car} onClick={() => setResultKey("unmatched")}>
            {ANPR_SAMPLES.unmatched.plate} — not on today's list
          </Button>
          <Button variant="danger" size="sm" icon={Car} onClick={() => setResultKey("unknown")}>
            {ANPR_SAMPLES.unknown.plate} — no match found
          </Button>
        </div>
      </Card>

      {data && (
        <>
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: meta.tone === "success" ? "var(--color-success-bg)" : meta.tone === "warning" ? "var(--color-warning-bg)" : "var(--color-danger-bg)" }}>
            <meta.icon size={24} style={{ color: `var(--color-${meta.tone})` }} />
            <div>
              <p className="text-sm font-bold" style={{ color: `var(--color-${meta.tone})` }}>{meta.label}</p>
              <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>Plate {data.plate}</p>
            </div>
          </div>

          {data.result === "MATCHED" ? (
            <Card className="p-5 space-y-2.5 text-xs">
              <Row icon={Car} label="Vehicle" value={data.plate} />
              <Row icon={Car} label="Visitor" value={data.visitor} />
              <Row icon={Car} label="Visiting" value={`${data.resident} · ${data.flat}`} />
              <Row icon={Car} label="Expected" value={data.expected} />
            </Card>
          ) : (
            <Card className="p-5">
              <p className="text-xs mb-4" style={{ color: "var(--color-text-secondary)" }}>
                No expected visitor is linked to this plate. Verify the driver's purpose manually before allowing entry.
              </p>
              <Button variant="primary" full onClick={onManualVerify}>Verify Manually</Button>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
