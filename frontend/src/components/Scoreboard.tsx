import type { Participant } from "../services/api";
import { Card } from "./Card";

interface ScoreboardProps {
  participants: Participant[];
}

export function Scoreboard({ participants }: ScoreboardProps) {
  const sorted = [...participants].sort((a, b) => b.score - a.score);

  return (
    <Card title="Scoreboard">
      {sorted.length === 0 ? (
        <div className="placeholder-block" style={{ backgroundColor: '#f9fafb' }}>
          <div className="placeholder-row">
            <span>Waiting for players...</span>
            <strong>0</strong>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "8px" }}>
          {sorted.map((p) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "#f9fafb",
                borderRadius: "6px",
                fontSize: "0.9375rem"
              }}
            >
              <span>{p.name}</span>
              <strong>{p.score}</strong>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
