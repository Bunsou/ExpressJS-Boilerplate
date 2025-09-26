import { describe, it, expect, vi } from "vitest";
import jwt from "jsonwebtoken";
import {
  generateTokenPair,
  JWTPayload,
} from "../../features/auth/services/jwt.service";

// Mock the entire jsonwebtoken library
vi.mock("jsonwebtoken");

describe("Unit Test: JWT Service", () => {
  it("should generate a token pair with the correct payload", () => {
    const payload: JWTPayload = {
      userId: "test-user-id",
      email: "test@example.com",
      role: "student",
    };

    // Make jwt.sign return a predictable value
    vi.mocked(jwt.sign).mockImplementation(() => "mocked.token.string");

    const tokens = generateTokenPair(
      payload.userId,
      payload.email,
      payload.role
    );

    // Assert the function's output
    expect(tokens.accessToken).toBe("mocked.token.string");
    expect(tokens.refreshToken).toBe("mocked.token.string");

    // Assert that jwt.sign was called correctly for both tokens
    expect(jwt.sign).toHaveBeenCalledTimes(2);
    expect(jwt.sign).toHaveBeenCalledWith(
      payload,
      expect.any(String),
      expect.any(Object)
    );
  });
});
