import request from "supertest";
import app from "../app"; // Your express app
import { db } from "../src/utils/db";
import { users } from "../src/db/schema";

// 1. Mock the DB module
jest.mock("../src/utils/db", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn(),
  },
}));

// Mocking Drizzle's specific behavior
const mockDb = db as any;

describe("Auth Endpoints", () => {
  it("should register a new user successfully", async () => {
    // Mocking "Email does not exist" (select returns empty array)
    mockDb.where.mockResolvedValue([]);
    // Mocking "Insert success"
    mockDb.values.mockResolvedValue([{ id: "1" }]);

    const res = await request(app).post("/api/auth/signup").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "Password123!",
      role: "author",
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body.Success).toBe(true);
    expect(res.body.Message).toBe("User registered successfully");
  });

  it("should fail if password is too weak", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "123", // Too short
      role: "author",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.Success).toBe(false);
    expect(res.body.Errors).toContain("Password must be at least 8 characters");
  });
});
