import { db } from "../utils/db";
import { readLogs, dailyAnalytics } from "../db/schema";
import { sql, eq, and } from "drizzle-orm";
import crypto from "crypto";

export const runDailyAggregation = async () => {
  try {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    yesterday.setUTCHours(0, 0, 0, 0);

    const nextDay = new Date(yesterday);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    console.log(`[Job] Aggregating logs for: ${yesterday.toUTCString()}`);

    const stats = await db
      .select({
        articleId: readLogs.articleId,
        count: sql<number>`count(${readLogs.id})`.mapWith(Number),
      })
      .from(readLogs)
      .where(
        and(
          sql`${readLogs.readAt} >= ${yesterday.toISOString()}`,
          sql`${readLogs.readAt} < ${nextDay.toISOString()}`,
        ),
      )
      .groupBy(readLogs.articleId);

    for (const stat of stats) {
      await db
        .insert(dailyAnalytics)
        .values({
          id: crypto.randomUUID(),
          articleId: stat.articleId,
          date: yesterday,
          viewCount: stat.count,
        })
        .onDuplicateKeyUpdate({
          set: { viewCount: stat.count },
        });
    }

    console.log(`[Job] Successfully aggregated ${stats.length} articles.`);
  } catch (error) {
    console.error("[Job Error]", error);
  }
};
