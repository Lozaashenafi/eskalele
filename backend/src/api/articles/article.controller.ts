import type { Request, Response } from "express";
import { db } from "../../utils/db";
import { articles, readLogs, users } from "../../db/schema";
import { eq, and, isNull, like, desc, count, or } from "drizzle-orm";
import { articleSchema } from "./article.schema";
import { sendResponse, sendPaginatedResponse } from "../../utils/response";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import { z } from "zod";
import crypto from "crypto";

// User Story 3: Create Article
export const createArticle = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = articleSchema.parse(req.body);
    const newId = crypto.randomUUID();

    await db.insert(articles).values({
      id: newId,
      title: validatedData.title,
      content: validatedData.content,
      category: validatedData.category,
      status: validatedData.status || "Draft",
      authorId: req.user!.sub,
    });

    return sendResponse(res, 201, "Article created successfully", {
      id: newId,
    });
  } catch (error: any) {
    const errors =
      error instanceof z.ZodError
        ? error.issues.map((e: any) => e.message)
        : [error.message];
    return sendResponse(res, 400, "Validation Failed", null, errors);
  }
};

// User Story 8: Author Content List (Includes Drafts & Published)
export const getMyArticles = async (req: AuthRequest, res: Response) => {
  const { page = 1, size = 10 } = req.query;
  const limit = Number(size);
  const offset = (Number(page) - 1) * limit;

  const [results, totalCount] = await Promise.all([
    db
      .select()
      .from(articles)
      .where(eq(articles.authorId, req.user!.sub))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(articles.createdAt)),
    db
      .select({ value: count() })
      .from(articles)
      .where(eq(articles.authorId, req.user!.sub)),
  ]);

  // Optionally mark soft-deleted ones as "Deleted" for the UI
  const formattedResults = results.map((a) => ({
    ...a,
    displayStatus: a.deletedAt ? "Deleted" : a.status,
  }));

  return sendPaginatedResponse(
    res,
    "Your articles fetched",
    formattedResults,
    Number(page),
    limit,
    totalCount[0].value,
  );
};

// User Story 3: Update Article
export const updateArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const articleId = Array.isArray(id) ? id[0] : id;
    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, articleId));

    if (!article) return sendResponse(res, 404, "Article not found");
    if (article.authorId !== req.user!.sub)
      return sendResponse(res, 403, "Forbidden", null, [
        "You do not own this article",
      ]);

    await db.update(articles).set(req.body).where(eq(articles.id, articleId));
    return sendResponse(res, 200, "Article updated successfully");
  } catch (error: any) {
    return sendResponse(res, 400, "Update failed", null, [error.message]);
  }
};

// User Story 4: Public News Feed
export const getPublicArticles = async (req: Request, res: Response) => {
  const { page = 1, size = 10, category, author, q } = req.query;
  const limit = Number(size);
  const offset = (Number(page) - 1) * limit;

  const filters = [
    eq(articles.status, "Published"),
    isNull(articles.deletedAt),
  ];
  if (category) filters.push(eq(articles.category, String(category)));
  if (q) filters.push(like(articles.title, `%${q}%`));

  const query = db
    .select({
      id: articles.id,
      title: articles.title,
      category: articles.category,
      createdAt: articles.createdAt,
      authorName: users.name,
    })
    .from(articles)
    .innerJoin(users, eq(articles.authorId, users.id))
    .where(and(...filters))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(articles.createdAt));

  const [results, total] = await Promise.all([
    query,
    db
      .select({ value: count() })
      .from(articles)
      .where(and(...filters)),
  ]);

  return sendPaginatedResponse(
    res,
    "Public feed fetched",
    results,
    Number(page),
    limit,
    total[0].value,
  );
};

// User Story 5: Read Tracking
export const getArticleDetail = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const articleId = Array.isArray(id) ? id[0] : id;
  const [article] = await db
    .select()
    .from(articles)
    .where(and(eq(articles.id, articleId), isNull(articles.deletedAt)));

  if (!article)
    return sendResponse(res, 404, "News article no longer available", null, [
      "Deleted or Not Found",
    ]);

  // Non-blocking log
  db.insert(readLogs)
    .values({
      id: crypto.randomUUID(),
      articleId: article.id,
      readerId: req.user?.sub || null,
    })
    .catch((err) => console.error("Log failed", err));

  return sendResponse(res, 200, "Article fetched", article);
};

// User Story 3: Soft Delete
export const softDeleteArticle = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const articleId = Array.isArray(id) ? id[0] : id;
  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, articleId));

  if (!article) return sendResponse(res, 404, "Not found");
  if (article.authorId !== req.user!.sub)
    return sendResponse(res, 403, "Forbidden", null, [
      "Cannot delete other's work",
    ]);

  await db
    .update(articles)
    .set({ deletedAt: new Date() })
    .where(eq(articles.id, articleId));
  return sendResponse(res, 200, "Article deleted successfully");
};
