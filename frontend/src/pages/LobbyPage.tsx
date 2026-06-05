import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { useRoomState, useRoomStore } from "../state/roomStore";

export function LobbyPage() {
  const navigate = useNavigate();
  const roomStore = useRoomStore();
  const { room, error, isLoading } = useRoomState();

  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
      return;
    }

    if (room.status !== "lobby") {
      navigate("/game");
      return;
    }

    roomStore.startPolling(2000);

    return () => {
      roomStore.stopPolling();
    };
  }, [navigate, room, roomStore]);

  async function handleStartGame() {
    try {
      await roomStore.startGame();
      navigate("/game");
    } catch {
      // error is set on roomStore state
    }
  }

  if (!room) {
    return null;
  }

  const playerCount = room.participants.length;
  const canStart = room.isHost && playerCount >= 2;

  return (
    <section className="panel placeholder-page">
      <div className="lobby-header">
        <PageHeader
          kicker="Waiting for players"
          title="Lobby"
          description="Share the room code with friends so they can join your game."
        />
        <RoomCodeBadge code={room.code} />
      </div>

      <div className="summary-grid">
        <Card title="Participants">
          {playerCount === 0 ? (
            <p>No participants are connected to this room yet.</p>
          ) : (
            <ul className="player-list">
              {room.participants.map((participant) => (
                <li key={participant.id}>
                  <span>{participant.name}</span>
                  {participant.id === room.hostParticipantId && (
                    <span className="player-list__meta player-list__meta--host">HOST</span>
                  )}
                  <span className="player-list__meta">joined</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Status">
          <p className="status-line" style={{ backgroundColor: isLoading ? '#fef3c7' : '#e0e7ff', color: isLoading ? '#b45309' : '#3730a3' }}>
            {isLoading ? "Refreshing players..." : `${playerCount} player${playerCount !== 1 ? "s" : ""} in lobby`}
          </p>
          <p style={{ marginTop: '8px' }}>{error ?? "Waiting for the host to start the game."}</p>
        </Card>
      </div>

      <div className="button-row button-row--spread">
        {room.isHost ? (
          <button className="button button--primary" disabled={!canStart || isLoading} onClick={handleStartGame}>
            {isLoading ? "Starting..." : "Start Game"}
          </button>
        ) : (
          <p className="form__help">Waiting for the host to start the game.</p>
        )}
      </div>
    </section>
  );
}
