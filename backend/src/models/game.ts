export type ParticipantRole = "drawer" | "guesser";
export type RoomStatus = "lobby" | "playing";

export interface Participant {
  id: string;
  name: string;
  joinedAt: string;
}

export interface Room {
  code: string;
  status: RoomStatus;
  hostParticipantId: string;
  drawerParticipantId?: string;
  secretWord?: string;
  participants: Participant[];
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
}

export interface RoomSessionResponse {
  participantId: string;
  room: RoomSnapshot;
}
