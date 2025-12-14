import { Router } from "express";
import multer from "multer";
import { body } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { openaiRecipe, visionIngredients } from "../controllers/aiController.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export const aiRouter = Router();

aiRouter.post("/vision/ingredients", requireAuth, upload.single("image"), asyncHandler(visionIngredients));

aiRouter.post(
  "/openai/recipe",
  requireAuth,
  [body("ingredients").isArray({ min: 1 }), body("style").optional().isString().isLength({ max: 40 })],
  asyncHandler(openaiRecipe)
);


