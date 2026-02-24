import request from "supertest";
import app from "../app";
import { db } from "../src/utils/db";
import jwt from "jsonwebtoken";

jest.mock("../src/utils/db");
const mockDb = db as any;

describe("Article Endpoints", () => {
  const mockToken = jwt.sign(
    { sub: "user-123", role: "author" },
    process.env.JWT_SECRET || "secret",
  );

  it("should soft delete an article if owner", async () => {
    // Mock finding the article
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest
          .fn()
          .mockResolvedValue([{ id: "art-1", authorId: "user-123" }]),
      }),
    });

    // Mock the update (soft delete)
    mockDb.update = jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue({ affectedRows: 1 }),
      }),
    });

    const res = await request(app)
      .delete("/api/articles/art-1")
      .set("Authorization", `Bearer ${mockToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.Message).toContain("Article deleted successfully");
  });
});
