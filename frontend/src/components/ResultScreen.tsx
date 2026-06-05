import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useRoomState, useRoomStore } from "../state/roomStore";
import { Card } from "./Card";

export function ResultScreen() {
  const navigate = useNavigate();
  const roomStore = useRoomStore();
  const { room } = useRoomState();

  const sorted = room
    ? [...room.participants].sort((a, b) => b.score - a.score)
    : [];

  const handleRestart = useCallback(async () => {
    await roomStore.restartGame();
    navigate("/lobby");
  }, [roomStore, navigate]);

  if (!room) {
    return null;
  }

  return (
    <section className="panel result-screen">
      <Card title="Round Over!">
        <p style={{ fontSize: "1.5rem", fontWeight: 700, textAlign: "center", margin: "0 0 16px" }}>
          The word was: <span style={{ color: "#6366f1" }}>{room.secretWord}</span>
        </p>

        <h3 style={{ margin: "0 0 8px" }}>Final Scores</h3>
        <div style={{ display: "grid", gap: "8px" }}>
          {sorted.map((p, i) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: i === 0 ? "#d1fae5" : "#f9fafb",
                borderRadius: "6px",
                fontSize: "0.9375rem"
              }}
            >
              <span>
                {i === 0 && "🏆 "}
                <strong>{p.name}</strong>
              </span>
              <strong>{p.score}</strong>
            </div>
          ))}
        </div>

        {room.guesses.length > 0 && (
          <>
            <h3 style={{ margin: "16px 0 8px" }}>Guesses</h3>
            <div style={{ display: "grid", gap: "6px" }}>
              {room.guesses.map((g, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: g.isCorrect ? "#d1fae5" : "#f9fafb",
                    borderRadius: "6px",
                    fontSize: "0.9375rem"
                  }}
                >
                  <span>
                    <strong>{g.participantName}</strong>: {g.text}
                  </span>
                  <span>{g.isCorrect ? "✓ Correct" : ""}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {room.isHost && (
        <div className="button-row" style={{ marginTop: "16px" }}>
          <button className="button button--primary" onClick={handleRestart}>
            New Game
          </button>
        </div>
      )}
    </section>
  );
}
