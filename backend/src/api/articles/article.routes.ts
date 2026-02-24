import { Router } from "express";
import * as ArticleController from "./article.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", ArticleController.getPublicArticles);

router.get(
  "/me",
  authenticate,
  authorize(["author"]),
  ArticleController.getMyArticles,
);

router.get(
  "/:id",
  (req: any, res, next) => {
    const token = req.headers.authorization;
    if (token) return authenticate(req, res, next);
    next();
  },
  ArticleController.getArticleDetail,
);

router.post(
  "/",
  authenticate,
  authorize(["author"]),
  ArticleController.createArticle,
);

router.put(
  "/:id",
  authenticate,
  authorize(["author"]),
  ArticleController.updateArticle,
);
router.delete(
  "/:id",
  authenticate,
  authorize(["author"]),
  ArticleController.softDeleteArticle,
);

export default router;
