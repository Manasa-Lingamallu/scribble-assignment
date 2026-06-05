import { useEffect } from "react";
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
          <Scoreboard />
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
            <div className="canvas-placeholder" style={{ minHeight: '500px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
              {isDrawer ? "Draw your word on the canvas!" : "Waiting for the drawer to start drawing..."}
            </div>
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
              <GuessForm />
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
