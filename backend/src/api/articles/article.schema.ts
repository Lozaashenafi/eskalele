import { z } from "zod";

export const articleSchema = z.object({
  title: z.string().min(1).max(150),
  content: z.string().min(50),
  category: z.string().min(1),
  status: z.enum(["Draft", "Published"]).optional().default("Draft"),
});
