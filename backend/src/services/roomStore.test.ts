import { describe, expect, it } from "vitest";
import { createRoom, getRoom, joinRoom, saveRoom, submitGuess, toRoomSnapshot } from "./roomStore.js";

describe("roomStore", () => {
  it("createRoom returns a room with a 4-character uppercase code", () => {
    const result = createRoom("Alice");

    expect(result.room.code).toMatch(/^[A-Z0-9]{4}$/);
    expect(result.room.participants).toHaveLength(1);
    expect(result.room.participants[0].name).toBe("Alice");
    expect(result.participantId).toBeDefined();
  });

  it("createRoom sets the creator as the host", () => {
    const result = createRoom("Alice");
    const room = getRoom(result.room.code);

    expect(room).not.toBeNull();
    expect(room!.hostParticipantId).toBe(result.participantId);
  });

  it("createRoom trims whitespace from player name", () => {
    const result = createRoom("  Alice  ");
    const room = getRoom(result.room.code);

    expect(room!.participants[0].name).toBe("Alice");
  });

  it("joinRoom returns null for an unknown room code", () => {
    const result = joinRoom("ZZZZ", "Bob");

    expect(result).toBeNull();
  });

  it("toRoomSnapshot marks the viewer as host when they are the host", () => {
    const result = createRoom("Alice");
    const room = getRoom(result.room.code)!;
    const snapshot = toRoomSnapshot(room, result.participantId);

    expect(snapshot.isHost).toBe(true);
  });

  it("toRoomSnapshot marks the viewer as non-host when they are not the host", () => {
    const hostResult = createRoom("Alice");
    const joinerResult = joinRoom(hostResult.room.code, "Bob")!;
    const room = getRoom(hostResult.room.code)!;
    const snapshot = toRoomSnapshot(room, joinerResult.participantId);

    expect(snapshot.isHost).toBe(false);
  });

  it("toRoomSnapshot sets role to drawer when viewer is the drawer", () => {
    const result = createRoom("Alice");
    const room = getRoom(result.room.code)!;
    room.drawerParticipantId = result.participantId;
    room.secretWord = "rocket";
    const snapshot = toRoomSnapshot(room, result.participantId);

    expect(snapshot.role).toBe("drawer");
    expect(snapshot.secretWord).toBe("rocket");
  });

  it("toRoomSnapshot sets role to guesser for non-drawer and omits secretWord", () => {
    const hostResult = createRoom("Alice");
    const joinerResult = joinRoom(hostResult.room.code, "Bob")!;
    const room = getRoom(hostResult.room.code)!;
    room.drawerParticipantId = hostResult.participantId;
    room.secretWord = "rocket";
    const snapshot = toRoomSnapshot(room, joinerResult.participantId);

    expect(snapshot.role).toBe("guesser");
    expect(snapshot.secretWord).toBeUndefined();
  });

  it("toRoomSnapshot includes drawerParticipantId for all viewers", () => {
    const result = createRoom("Alice");
    const room = getRoom(result.room.code)!;
    room.drawerParticipantId = result.participantId;
    const snapshot = toRoomSnapshot(room, result.participantId);

    expect(snapshot.drawerParticipantId).toBe(result.participantId);
  });

  it("submitGuess returns null for an unknown room", () => {
    const result = submitGuess("ZZZZ", "p1", "hello");

    expect(result).toBeNull();
  });

  it("submitGuess returns null for a room not in playing status", () => {
    const { room } = createRoom("Alice");

    const result = submitGuess(room.code, "p1", "hello");

    expect(result).toBeNull();
  });

  it("submitGuess returns null when the drawer tries to guess", () => {
    const hostResult = createRoom("Alice");
    const room = getRoom(hostResult.room.code)!;
    room.drawerParticipantId = hostResult.participantId;
    room.secretWord = "rocket";
    room.status = "playing";
    saveRoom(room);

    const result = submitGuess(room.code, hostResult.participantId, "hello");

    expect(result).toBeNull();
  });

  it("submitGuess returns null for empty whitespace-only guess", () => {
    const hostResult = createRoom("Alice");
    const joinerResult = joinRoom(hostResult.room.code, "Bob")!;
    const room = getRoom(hostResult.room.code)!;
    room.drawerParticipantId = hostResult.participantId;
    room.secretWord = "rocket";
    room.status = "playing";
    saveRoom(room);

    const result = submitGuess(room.code, joinerResult.participantId, "   ");

    expect(result).toBeNull();
  });

  it("submitGuess marks correct guess and awards 100 points", () => {
    const hostResult = createRoom("Alice");
    const joinerResult = joinRoom(hostResult.room.code, "Bob")!;
    const room = getRoom(hostResult.room.code)!;
    room.drawerParticipantId = hostResult.participantId;
    room.secretWord = "rocket";
    room.status = "playing";
    saveRoom(room);

    const result = submitGuess(room.code, joinerResult.participantId, "rocket")!;

    expect(result.guess.isCorrect).toBe(true);
    expect(result.guess.text).toBe("rocket");

    const updatedRoom = getRoom(room.code)!;
    const bob = updatedRoom.participants.find((p) => p.id === joinerResult.participantId)!;
    expect(bob.score).toBe(100);
  });

  it("submitGuess marks correct guess case-insensitively", () => {
    const hostResult = createRoom("Alice");
    const joinerResult = joinRoom(hostResult.room.code, "Bob")!;
    const room = getRoom(hostResult.room.code)!;
    room.drawerParticipantId = hostResult.participantId;
    room.secretWord = "rocket";
    room.status = "playing";
    saveRoom(room);

    const result = submitGuess(room.code, joinerResult.participantId, "ROCKET")!;

    expect(result.guess.isCorrect).toBe(true);
  });

  it("submitGuess trims whitespace before comparison", () => {
    const hostResult = createRoom("Alice");
    const joinerResult = joinRoom(hostResult.room.code, "Bob")!;
    const room = getRoom(hostResult.room.code)!;
    room.drawerParticipantId = hostResult.participantId;
    room.secretWord = "rocket";
    room.status = "playing";
    saveRoom(room);

    const result = submitGuess(room.code, joinerResult.participantId, "  rocket  ")!.guess;

    expect(result.isCorrect).toBe(true);
    expect(result.text).toBe("rocket");
  });

  it("submitGuess marks incorrect guess and scores 0", () => {
    const hostResult = createRoom("Alice");
    const joinerResult = joinRoom(hostResult.room.code, "Bob")!;
    const room = getRoom(hostResult.room.code)!;
    room.drawerParticipantId = hostResult.participantId;
    room.secretWord = "rocket";
    room.status = "playing";
    saveRoom(room);

    const result = submitGuess(room.code, joinerResult.participantId, "pizza")!;

    expect(result.guess.isCorrect).toBe(false);

    const updatedRoom = getRoom(room.code)!;
    const bob = updatedRoom.participants.find((p) => p.id === joinerResult.participantId)!;
    expect(bob.score).toBe(0);
  });

  it("toRoomSnapshot includes guesses", () => {
    const hostResult = createRoom("Alice");
    const joinerResult = joinRoom(hostResult.room.code, "Bob")!;
    const room = getRoom(hostResult.room.code)!;
    room.drawerParticipantId = hostResult.participantId;
    room.secretWord = "rocket";
    room.status = "playing";
    saveRoom(room);

    submitGuess(room.code, joinerResult.participantId, "rocket");

    const storedRoom = getRoom(room.code)!;
    const snapshot = toRoomSnapshot(storedRoom, joinerResult.participantId);

    expect(snapshot.guesses).toHaveLength(1);
    expect(snapshot.guesses[0].text).toBe("rocket");
    expect(snapshot.guesses[0].isCorrect).toBe(true);
  });

  it("participants start with score 0", () => {
    const result = createRoom("Alice");

    expect(result.room.participants[0].score).toBe(0);
  });
});
