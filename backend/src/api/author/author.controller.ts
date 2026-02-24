import { Response } from "express";
import { db } from "../../utils/db";
import { articles, dailyAnalytics } from "../../db/schema";
import { eq, sql, isNull, and, desc } from "drizzle-orm";
import { sendPaginatedResponse } from "../../utils/response";
import type { AuthRequest } from "../../middlewares/auth.middleware";

export const getAuthorDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const size = Number(req.query.size) || 10;
    const offset = (page - 1) * size;

    const dashboardData = await db
      .select({
        title: articles.title,
        createdAt: articles.createdAt,
        totalViews:
          sql<number>`CAST(COALESCE(SUM(${dailyAnalytics.viewCount}), 0) AS UNSIGNED)`.mapWith(
            Number,
          ),
      })
      .from(articles)
      .leftJoin(dailyAnalytics, eq(articles.id, dailyAnalytics.articleId))
      .where(
        and(
          eq(articles.authorId, req.user!.sub),
          isNull(articles.deletedAt), // Requirement: Excluding soft-deleted
        ),
      )
      .groupBy(articles.id)
      .limit(size)
      .offset(offset)
      .orderBy(desc(articles.createdAt));

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(articles)
      .where(
        and(eq(articles.authorId, req.user!.sub), isNull(articles.deletedAt)),
      );

    const total = countResult[0]?.count || 0;

    return sendPaginatedResponse(
      res,
      "Author performance metrics fetched",
      dashboardData,
      page,
      size,
      total,
    );
  } catch (error: any) {
    return res.status(500).json({
      Success: false,
      Message: "Failed to fetch dashboard",
      Errors: [error.message],
    });
  }
};
