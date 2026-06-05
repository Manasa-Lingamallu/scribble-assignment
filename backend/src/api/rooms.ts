import { Router } from "express";
import {
  createRoomSchema,
  guessSchema,
  HttpError,
  joinRoomSchema,
  roomCodeParamsSchema,
  roomViewerQuerySchema,
  startGameSchema
} from "./schemas.js";
import { createRoom, getRoom, joinRoom, saveRoom, submitGuess, toRoomSnapshot, updateCanvas } from "../services/roomStore.js";
import { STARTER_WORDS } from "../seed/starterData.js";

export function createRoomsRouter() {
  const router = Router();

  router.post("/", (request, response, next) => {
    try {
      const { playerName } = createRoomSchema.parse(request.body);
      const result = createRoom(playerName);

      response.status(201).json({
        participantId: result.participantId,
        room: toRoomSnapshot(result.room, result.participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/join", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { playerName } = joinRoomSchema.parse(request.body);
      const result = joinRoom(code.toUpperCase(), playerName);

      if (!result) {
        throw new HttpError(404, "Unable to join room");
      }

      response.json({
        participantId: result.participantId,
        room: toRoomSnapshot(result.room, result.participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:code/start", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = startGameSchema.parse(request.body);
      const room = getRoom(code.toUpperCase());

      if (!room) {
        throw new HttpError(404, "Room not found");
      }

      if (room.hostParticipantId !== participantId) {
        throw new HttpError(403, "Only the host can start the game");
      }

      if (room.participants.length < 2) {
        throw new HttpError(400, "At least 2 players are required to start");
      }

      room.drawerParticipantId = room.hostParticipantId;
      room.secretWord = STARTER_WORDS[0];
      room.status = "playing";
      const updatedRoom = saveRoom(room)!;

      response.json({
        room: toRoomSnapshot(updatedRoom, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/guess", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId, text } = guessSchema.parse(request.body);
      const result = submitGuess(code.toUpperCase(), participantId, text);

      if (!result) {
        throw new HttpError(400, "Unable to submit guess");
      }

      response.json({
        guess: result.guess,
        room: toRoomSnapshot(result.room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.put("/:code/canvas", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { dataUrl } = request.body as { dataUrl: string };

      if (typeof dataUrl !== "string") {
        throw new HttpError(400, "Invalid canvas data");
      }

      const updated = updateCanvas(code.toUpperCase(), dataUrl);

      if (!updated) {
        throw new HttpError(404, "Room not found");
      }

      response.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:code", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = roomViewerQuerySchema.parse(request.query);
      const room = getRoom(code.toUpperCase());

      if (!room) {
        throw new HttpError(404, "Unable to load room");
      }

      response.json({
        room: toRoomSnapshot(room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
