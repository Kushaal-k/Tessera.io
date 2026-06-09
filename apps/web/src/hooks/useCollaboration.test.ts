import { describe, expect, it } from "vitest";
import { createDefaultParticipant } from "./useCollaboration.js";

describe("createDefaultParticipant", () => {
  it("returns all required Participant fields", () => {
    const p = createDefaultParticipant();
    expect(p).toHaveProperty("id");
    expect(p).toHaveProperty("displayName");
    expect(p).toHaveProperty("isAI");
    expect(p).toHaveProperty("cursorColor");
  });

  it("uses 'Anonymous' as the default displayName", () => {
    const p = createDefaultParticipant();
    expect(p.displayName).toBe("Anonymous");
  });

  it("sets isAI to false by default", () => {
    const p = createDefaultParticipant();
    expect(p.isAI).toBe(false);
  });

  it("generates a UUID-format id", () => {
    const p = createDefaultParticipant();
    expect(p.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("generates a valid hex color for cursorColor", () => {
    const p = createDefaultParticipant();
    expect(p.cursorColor).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("applies overrides over defaults", () => {
    const p = createDefaultParticipant({ displayName: "Pals", isAI: true });
    expect(p.displayName).toBe("Pals");
    expect(p.isAI).toBe(true);
  });

  it("overrides do not disturb other default fields", () => {
    const p = createDefaultParticipant({ displayName: "Pals" });
    expect(p.isAI).toBe(false);
    expect(p.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("generates unique ids across multiple calls", () => {
    const ids = new Set(
      Array.from({ length: 20 }, () => createDefaultParticipant().id),
    );
    expect(ids.size).toBe(20);
  });
});