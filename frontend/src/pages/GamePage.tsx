import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { GuessForm } from "../components/GuessForm";
import { ResultPanel } from "../components/ResultPanel";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { Scoreboard } from "../components/Scoreboard";
import { useRoomState, useRoomStore } from "../state/roomStore";

export function GamePage() {
  const navigate = useNavigate();
  const roomStore = useRoomStore();
  const { room, participantId } = useRoomState();
  const [guessError, setGuessError] = useState<string | null>(null);

  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
      return;
    }

    roomStore.startPolling(2000);

    return () => {
      roomStore.stopPolling();
    };
  }, [navigate, room, roomStore]);

  if (!room) {
    return null;
  }

  const isDrawer = room.role === "drawer";
  const drawerId = room.drawerParticipantId;
  const drawer = room.participants.find((participant) => participant.id === drawerId) ?? null;
  const viewer = room.participants.find((participant) => participant.id === participantId) ?? null;

  const handleSubmitGuess = useCallback(
    async (text: string) => {
      setGuessError(null);
      try {
        await roomStore.submitGuess(text);
        return null;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to submit guess";
        setGuessError(message);
        return message;
      }
    },
    [roomStore]
  );

  return (
    <section className="panel game-page">
      <div className="game-page__header">
        <div className="game-page__header-left">
          <span className="section-kicker">Round 1</span>
          <h1 className="game-page__title">Guess the Word!</h1>
        </div>
        <RoomCodeBadge code={room.code} />
      </div>

      <div className="game-page__layout">
        <aside className="game-page__sidebar game-page__sidebar--left">
          <Scoreboard participants={room.participants} />
          <ResultPanel />
        </aside>

        <div className="game-page__main">
          {isDrawer && room.secretWord && (
            <Card title="Your Secret Word">
              <p style={{ fontSize: "2rem", fontWeight: 700, textAlign: "center", margin: 0 }}>
                {room.secretWord}
              </p>
            </Card>
          )}

          <Card title="Canvas">
            {isDrawer ? (
              <CanvasDraw onCanvasChange={(dataUrl) => roomStore.updateCanvas(dataUrl)} />
            ) : room.canvasDataUrl ? (
              <img
                src={room.canvasDataUrl}
                alt="Drawer's canvas"
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                  aspectRatio: "3 / 2",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px"
                }}
              />
            ) : (
              <div className="canvas-placeholder" style={{ minHeight: "500px", backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
                Waiting for the drawer to start drawing...
              </div>
            )}
          </Card>

          <Card title="Guess History">
            {room.guesses.length === 0 ? (
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>No guesses yet.</p>
            ) : (
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
            )}
          </Card>
        </div>

        <aside className="game-page__sidebar game-page__sidebar--right">
          <Card title="Player Info">
            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{viewer?.name ?? "Unknown player"}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{isDrawer ? "Drawer" : "Guesser"}</dd>
              </div>
              {!isDrawer && drawer && (
                <div>
                  <dt>Drawer</dt>
                  <dd>{drawer.name}</dd>
                </div>
              )}
            </dl>
          </Card>

          {!isDrawer && (
            <Card title="Your Guess">
              <GuessForm onSubmitGuess={handleSubmitGuess} />
              {guessError && <p className="form__error">{guessError}</p>}
            </Card>
          )}
        </aside>
      </div>

      <div className="button-row">
        <button className="button button--secondary" onClick={() => navigate("/lobby")}>
          Exit Game
        </button>
      </div>
    </section>
  );
}

interface CanvasDrawProps {
  onCanvasChange: (dataUrl: string) => void;
}

function CanvasDraw({ onCanvasChange }: CanvasDrawProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  function sendCanvas() {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    onCanvasChange(canvas.toDataURL());
  }

  useEffect(() => {
    const canvas = canvasRef.current!;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d")!;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 3;
    context.strokeStyle = "#000";

    function getPos(event: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }

    function onMouseDown(event: MouseEvent) {
      drawing.current = true;
      const pos = getPos(event);
      context.beginPath();
      context.moveTo(pos.x, pos.y);
    }

    function onMouseMove(event: MouseEvent) {
      if (!drawing.current) return;
      const pos = getPos(event);
      context.lineTo(pos.x, pos.y);
      context.stroke();
    }

    function onMouseUp() {
      drawing.current = false;

      const cvs = canvasRef.current;

      if (cvs) {
        onCanvasChange(cvs.toDataURL());
      }
    }

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseleave", onMouseUp);
    };
  }, [onCanvasChange]);

  function clearCanvas() {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d")!;
    context.clearRect(0, 0, canvas.width, canvas.height);
    onCanvasChange(canvas.toDataURL());
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          aspectRatio: "3 / 2",
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          cursor: "crosshair",
          borderRadius: "6px"
        }}
      />
      <div className="button-row" style={{ marginTop: "12px" }}>
        <button className="button button--secondary" type="button" onClick={clearCanvas}>
          Clear Canvas
        </button>
      </div>
    </div>
  );
}
