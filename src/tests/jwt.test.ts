import { describe, it, expect } from "vitest";
import { signToken, verifyToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";

describe("JWT utilities", () => {
  it("signs and verifies a token", () => {
    const userId = "12345";
    const token = signToken(userId);
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");

    const payload = verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload!.userId).toBe(userId);
  });

  it("signs and verifies a refresh token", () => {
    const userId = "67890";
    const token = signRefreshToken(userId);
    expect(token).toBeTruthy();

    const payload = verifyRefreshToken(token);
    expect(payload).not.toBeNull();
    expect(payload!.userId).toBe(userId);
  });

  it("returns null for invalid token", () => {
    const payload = verifyToken("invalid-token");
    expect(payload).toBeNull();
  });

  it("returns null for tampered token", () => {
    const token = signToken("12345");
    const tampered = token.slice(0, -5) + "xxxxx";
    expect(verifyToken(tampered)).toBeNull();
  });
});
