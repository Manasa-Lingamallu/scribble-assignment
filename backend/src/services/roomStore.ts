import { randomUUID } from "node:crypto";
import type { Guess, Participant, Room, RoomSnapshot } from "../models/game.js";
import { STARTER_ROLES, STARTER_WORDS } from "../seed/starterData.js";

const rooms = new Map<string, Room>();

function now() {
  return new Date().toISOString();
}

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let index = 0; index < 4; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

function generateUniqueCode() {
  let code = generateCode();

  while (rooms.has(code)) {
    code = generateCode();
  }

  return code;
}

function displayName(name?: string) {
  const trimmed = name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "Player";
}

function createParticipant(name?: string): Participant {
  return {
    id: randomUUID(),
    name: displayName(name),
    joinedAt: now(),
    score: 0
  };
}

function cloneRoom(room: Room) {
  return structuredClone(room);
}

export function listWords() {
  return [...STARTER_WORDS];
}

export function createRoom(playerName?: string) {
  const participant = createParticipant(playerName);
  const room: Room = {
    code: generateUniqueCode(),
    status: "lobby",
    hostParticipantId: participant.id,
    participants: [participant],
    guesses: [],
    createdAt: now(),
    updatedAt: now()
  };

  rooms.set(room.code, room);

  return {
    room: cloneRoom(room),
    participantId: participant.id
  };
}

export function joinRoom(code: string, playerName?: string) {
  const room = rooms.get(code);

  if (!room) {
    return null;
  }

  const participant = createParticipant(playerName);
  room.participants.push(participant);
  room.updatedAt = now();
  rooms.set(room.code, room);

  return {
    room: cloneRoom(room),
    participantId: participant.id
  };
}

export function submitGuess(
  roomCode: string,
  participantId: string,
  text: string
): { guess: Guess; room: Room } | null {
  const room = rooms.get(roomCode);

  if (!room) return null;

  if (room.status !== "playing") return null;

  const participant = room.participants.find((p) => p.id === participantId);
  if (!participant) return null;

  if (room.drawerParticipantId === participantId) return null;

  const trimmed = text.trim();
  if (!trimmed) return null;

  const isCorrect = trimmed.toLowerCase() === (room.secretWord ?? "").toLowerCase();

  const guess: Guess = {
    participantId,
    participantName: participant.name,
    text: trimmed,
    isCorrect,
    createdAt: now()
  };

  room.guesses.push(guess);

  if (isCorrect) {
    participant.score += 100;
    room.status = "finished";
  }

  room.updatedAt = now();
  rooms.set(roomCode, room);

  return { guess, room: cloneRoom(room) };
}

export function endRound(roomCode: string, participantId: string): { room: Room } | null {
  const room = rooms.get(roomCode);

  if (!room) return null;
  if (room.status !== "playing") return null;
  if (room.hostParticipantId !== participantId) return null;

  room.status = "finished";
  room.updatedAt = now();
  rooms.set(roomCode, room);

  return { room: cloneRoom(room) };
}

export function restartGame(roomCode: string, participantId: string): { room: Room } | null {
  const room = rooms.get(roomCode);

  if (!room) return null;
  if (room.status !== "finished") return null;
  if (room.hostParticipantId !== participantId) return null;

  room.status = "lobby";
  room.drawerParticipantId = undefined;
  room.secretWord = undefined;
  room.guesses = [];
  room.canvasDataUrl = undefined;

  for (const participant of room.participants) {
    participant.score = 0;
  }

  room.updatedAt = now();
  rooms.set(roomCode, room);

  return { room: cloneRoom(room) };
}

export function updateCanvas(roomCode: string, dataUrl: string): boolean {
  const room = rooms.get(roomCode);

  if (!room) return false;

  room.canvasDataUrl = dataUrl;
  room.updatedAt = now();
  rooms.set(roomCode, room);

  return true;
}

export function getRoom(code: string) {
  const room = rooms.get(code);
  return room ? cloneRoom(room) : null;
}

export function saveRoom(room: Room) {
  room.updatedAt = now();
  rooms.set(room.code, cloneRoom(room));
  return getRoom(room.code);
}

export function toRoomSnapshot(room: Room, viewerParticipantId?: string): RoomSnapshot {
  const isViewerDrawer = viewerParticipantId
    ? room.drawerParticipantId === viewerParticipantId
    : false;

  return {
    code: room.code,
    status: room.status,
    participants: room.participants.map((participant) => ({ ...participant })),
    hostParticipantId: room.hostParticipantId,
    drawerParticipantId: room.drawerParticipantId ?? room.hostParticipantId,
    secretWord: isViewerDrawer || room.status === "finished" ? room.secretWord : undefined,
    role: isViewerDrawer ? "drawer" : "guesser",
    availableWords: listWords(),
    roles: [...STARTER_ROLES],
    isHost: viewerParticipantId ? room.hostParticipantId === viewerParticipantId : false,
    guesses: [...room.guesses],
    canvasDataUrl: room.canvasDataUrl
  };
}
