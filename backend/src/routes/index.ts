import { Router } from "express";
import authRoutes from "../api/auth/auth.route";
import articleRoutes from "../api/articles/article.routes";
import authorRoutes from "../api/author/author.route";
const rootRouter = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/articles", articleRoutes);
rootRouter.use("/author", authorRoutes);

export default rootRouter;
