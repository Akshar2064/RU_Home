import { useState } from "react";
import { ShieldCheck, ShieldAlert, LogIn, LogOut as ExitIcon, Search } from "lucide-react";
import { Card, Badge, Avatar, Button, EmptyState } from "../ui.jsx";

export default function Staff({ workers, onEntry, onExit }) {
  const [query, setQuery] = useState("");
  const filtered = query
    ? workers.filter((w) => w.name.toLowerCase().includes(query.toLowerCase()) || w.category.toLowerCase().includes(query.toLowerCase()) || w.flat.toLowerCase().includes(query.toLowerCase()))
    : workers;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ border: "1px solid var(--color-border)", background: "#fff" }}>
        <Search size={16} style={{ color: "var(--color-text-tertiary)" }} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search worker, category or flat" className="w-full text-sm outline-none bg-transparent" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No workers found" body="Try a different name, category or flat number." />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((w) => (
            <Card key={w.id} className="p-4">
              <div className="flex items-center gap-3">
                <Avatar initials={w.name.slice(0, 2).toUpperCase()} tone="navy" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{w.name}</p>
                  <p className="text-[11px] truncate" style={{ color: "var(--color-text-secondary)" }}>{w.category} · {w.flat} · {w.resident}</p>
                </div>
                {w.verified ? (
                  <Badge tone="success" size="sm"><ShieldCheck size={11} />Verified</Badge>
                ) : (
                  <Badge tone="warning" size="sm"><ShieldAlert size={11} />Pending</Badge>
                )}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
                <div>
                  <p className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>{w.accessMethod}</p>
                  <Badge tone={w.status === "Inside" ? "info" : "neutral"} size="sm">{w.status}{w.entryTime ? ` · ${w.entryTime}` : ""}</Badge>
                </div>
                {!w.verified ? (
                  <Button variant="secondary" size="sm">Pending verification</Button>
                ) : w.status === "Inside" ? (
                  <Button variant="danger" size="sm" icon={ExitIcon} onClick={() => onExit(w.id)}>Exit</Button>
                ) : (
                  <Button variant="primary" size="sm" icon={LogIn} onClick={() => onEntry(w.id)}>Entry</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
