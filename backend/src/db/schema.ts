import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  mysqlEnum,
  unique,
  int,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 191 }).notNull(),
  email: varchar("email", { length: 191 }).notNull().unique(), // Reduced from 255 to 191
  password: varchar("password", { length: 191 }).notNull(),
  role: mysqlEnum("role", ["author", "reader"]).notNull(),
});

export const articles = mysqlTable("articles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 150 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["Draft", "Published"]).default("Draft"),
  authorId: varchar("author_id", { length: 36 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const readLogs = mysqlTable("read_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  articleId: varchar("article_id", { length: 36 }).notNull(),
  readerId: varchar("reader_id", { length: 36 }),
  readAt: timestamp("read_at").defaultNow(),
});

export const dailyAnalytics = mysqlTable(
  "daily_analytics",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    articleId: varchar("article_id", { length: 36 }).notNull(),
    viewCount: int("view_count").default(0),
    date: timestamp("date").notNull(),
  },
  (t) => ({
    unq: unique().on(t.articleId, t.date),
  }),
);
