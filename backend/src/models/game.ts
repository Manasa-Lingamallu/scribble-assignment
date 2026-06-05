export type ParticipantRole = "drawer" | "guesser";
export type RoomStatus = "lobby" | "playing";

export interface Participant {
  id: string;
  name: string;
  joinedAt: string;
  score: number;
}

export interface Guess {
  participantId: string;
  participantName: string;
  text: string;
  isCorrect: boolean;
  createdAt: string;
}

export interface Room {
  code: string;
  status: RoomStatus;
  hostParticipantId: string;
  drawerParticipantId?: string;
  secretWord?: string;
  participants: Participant[];
  guesses: Guess[];
  canvasDataUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomSnapshot {
  code: string;
  status: RoomStatus;
  participants: Participant[];
  hostParticipantId: string;
  drawerParticipantId: string;
  secretWord?: string;
  role: ParticipantRole;
  availableWords: string[];
  roles: ParticipantRole[];
  isHost: boolean;
  guesses: Guess[];
  canvasDataUrl?: string;
}

export interface RoomSessionResponse {
  participantId: string;
  room: RoomSnapshot;
}
