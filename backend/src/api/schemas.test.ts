import { describe, expect, it } from "vitest";
import {
  createRoomSchema,
  guessSchema,
  joinRoomSchema,
  roomCodeParamsSchema,
  startGameSchema
} from "./schemas.js";

describe("schemas", () => {
  describe("createRoomSchema", () => {
    it("accepts a valid body with playerName", () => {
      const result = createRoomSchema.parse({ playerName: "Alice" });

      expect(result.playerName).toBe("Alice");
    });

    it("accepts a body without playerName", () => {
      const result = createRoomSchema.parse({});

      expect(result.playerName).toBeUndefined();
    });

    it("rejects empty playerName", () => {
      expect(() => createRoomSchema.parse({ playerName: "" })).toThrow();
    });

    it("rejects whitespace-only playerName", () => {
      expect(() => createRoomSchema.parse({ playerName: "   " })).toThrow();
    });
  });

  describe("joinRoomSchema", () => {
    it("rejects empty playerName", () => {
      expect(() => joinRoomSchema.parse({ playerName: "" })).toThrow();
    });

    it("rejects whitespace-only playerName", () => {
      expect(() => joinRoomSchema.parse({ playerName: "   " })).toThrow();
    });
  });

  describe("startGameSchema", () => {
    it("accepts a valid body with participantId", () => {
      const result = startGameSchema.parse({ participantId: "abc-123" });

      expect(result.participantId).toBe("abc-123");
    });

    it("rejects a body without participantId", () => {
      expect(() => startGameSchema.parse({})).toThrow();
    });
  });

  describe("guessSchema", () => {
    it("accepts a valid guess", () => {
      const result = guessSchema.parse({ participantId: "p1", text: "hello" });

      expect(result.participantId).toBe("p1");
      expect(result.text).toBe("hello");
    });

    it("trims whitespace from guess text", () => {
      const result = guessSchema.parse({ participantId: "p1", text: "  hello  " });

      expect(result.text).toBe("hello");
    });

    it("rejects empty guess text", () => {
      expect(() => guessSchema.parse({ participantId: "p1", text: "" })).toThrow();
    });

    it("rejects whitespace-only guess text", () => {
      expect(() => guessSchema.parse({ participantId: "p1", text: "   " })).toThrow();
    });
  });

  describe("roomCodeParamsSchema", () => {
    it("rejects missing code", () => {
      expect(() => roomCodeParamsSchema.parse({})).toThrow();
    });
  });
});
