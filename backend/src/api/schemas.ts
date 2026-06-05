import { z } from "zod";

const playerNameField = z.string().trim().min(1, "Player name cannot be empty").optional();

export const createRoomSchema = z.object({
  playerName: playerNameField
});

export const joinRoomSchema = z.object({
  playerName: playerNameField
});

export const participantIdSchema = z.object({
  participantId: z.string()
});

export const startGameSchema = participantIdSchema;

export const roomCodeParamsSchema = z.object({
  code: z.string()
});

export const guessSchema = z.object({
  participantId: z.string(),
  text: z.string().trim().min(1, "Guess cannot be empty")
});

export const roomViewerQuerySchema = z.object({
  participantId: z.string().optional()
});

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
