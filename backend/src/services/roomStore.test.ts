import { describe, expect, it } from "vitest";
import { createRoom, getRoom, joinRoom, toRoomSnapshot } from "./roomStore.js";

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
});
