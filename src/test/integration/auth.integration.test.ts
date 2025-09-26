import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../../app"; // Your main Express app instance
import { testDb } from "../setup"; // The test database instance
import { usersTable } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Integration Test: POST /auth/register", () => {
  it("should register a new user, save it to the test DB, and return a 201 status", async () => {
    const userData = {
      email: "integration.test@example.com",
      password: "StrongPassword123",
      full_name: "Integration Test User",
    };

    const response = await supertest(app).post("/auth/register").send(userData);

    // 1. Assert the HTTP response is correct
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Registration successful. Please check your email."
    );
    expect(response.body.data).toHaveProperty("userId");

    // 2. Assert that the user was actually created in the test database
    const userId = response.body.data.userId;
    const userInDb = await testDb.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    expect(userInDb).toBeDefined();
    expect(userInDb?.email).toBe(userData.email);
  });

  it("should return a 409 conflict error if the email already exists", async () => {
    // First, create a user
    const userData = {
      email: "existing.user@example.com",
      password: "Password123",
      full_name: "Existing User",
    };
    await supertest(app).post("/auth/register").send(userData);

    // Then, try to create the same user again
    const response = await supertest(app).post("/auth/register").send(userData);

    // Assert the error response
    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("EMAIL_ALREADY_EXISTS");
  });
});
