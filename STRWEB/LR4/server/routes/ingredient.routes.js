import { Router } from "express";
import { body } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  listIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient
} from "../controllers/ingredientController.js";

export const ingredientRouter = Router();

ingredientRouter.get("/", asyncHandler(listIngredients)); // public read
ingredientRouter.post(
  "/",
  requireAuth,
  [
    body("name").isString().isLength({ min: 2, max: 40 }),
    body("price").isFloat({ min: 0, max: 1000 }),
    body("isVeg").optional().isBoolean(),
    body("allergens").optional().isArray()
  ],
  asyncHandler(createIngredient)
);

ingredientRouter.put(
  "/:id",
  requireAuth,
  [
    body("name").optional().isString().isLength({ min: 2, max: 40 }),
    body("price").optional().isFloat({ min: 0, max: 1000 }),
    body("isVeg").optional().isBoolean(),
    body("allergens").optional().isArray()
  ],
  asyncHandler(updateIngredient)
);

ingredientRouter.delete("/:id", requireAuth, asyncHandler(deleteIngredient));


