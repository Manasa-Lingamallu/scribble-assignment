import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./api";

function makeRoom(overrides: Record<string, unknown> = {}) {
  return {
    code: "ABCD",
    status: "lobby",
    participants: [],
    hostParticipantId: "p1",
    drawerParticipantId: "p1",
    role: "drawer",
    isHost: true,
    guesses: [],
    ...overrides
  };
}

describe("api service", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("createRoom sends POST to /rooms with playerName in body", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          participantId: "p1",
          room: makeRoom(),
        }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

    await api.createRoom("Alice");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rooms"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ playerName: "Alice" }),
      })
    );
  });

  it("fetchRoom sends GET to /rooms/:code with participantId query param", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          room: makeRoom({ code: "XYZW", isHost: false }),
        }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

    await api.fetchRoom("XYZW", "p1");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rooms/XYZW?participantId=p1"),
      expect.anything()
    );
  });

  it("startGame sends PATCH to /rooms/:code/start with participantId in body", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          room: makeRoom({ status: "playing" }),
        }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

    await api.startGame("ABCD", "p1");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rooms/ABCD/start"),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ participantId: "p1" }),
      })
    );
  });

  it("submitGuess sends POST to /rooms/:code/guess with participantId and text", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          guess: { participantId: "p1", participantName: "Alice", text: "rocket", isCorrect: true, createdAt: "2026-01-01T00:00:00.000Z" },
          room: makeRoom({ status: "playing" }),
        }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

    await api.submitGuess("ABCD", "p1", "rocket");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rooms/ABCD/guess"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ participantId: "p1", text: "rocket" }),
      })
    );
  });

  it("endRound sends PATCH to /rooms/:code/end-round with participantId", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          room: makeRoom({ status: "finished" }),
        }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

    await api.endRound("ABCD", "p1");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rooms/ABCD/end-round"),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ participantId: "p1" }),
      })
    );
  });

  it("restartGame sends POST to /rooms/:code/restart with participantId", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          room: makeRoom({ status: "lobby" }),
        }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

    await api.restartGame("ABCD", "p1");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rooms/ABCD/restart"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ participantId: "p1" }),
      })
    );
  });
});
