import { Router } from "express";
import { body } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { poeRecipe } from "../controllers/aiController.js";

export const aiRouter = Router();

aiRouter.post(
  "/poe/recipe",
  requireAuth,
  [body("name").isString().isLength({ min: 2, max: 120 })],
  asyncHandler(poeRecipe)
);


