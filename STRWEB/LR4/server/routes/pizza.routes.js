import { Router } from "express";
import { body } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { createPizza, deletePizza, getPizza, listPizzas, updatePizza } from "../controllers/pizzaController.js";

export const pizzaRouter = Router();

pizzaRouter.get("/", asyncHandler(listPizzas)); // public
pizzaRouter.get("/:id", asyncHandler(getPizza)); // public

pizzaRouter.post(
  "/",
  requireAuth,
  [
    body("name").isString().isLength({ min: 2, max: 80 }),
    body("description").optional().isString().isLength({ max: 400 }),
    body("imageUrl").optional().isString().isLength({ max: 500 }),
    body("basePrice").isFloat({ min: 0, max: 5000 }),
    body("isAvailable").optional().isBoolean(),
    body("tags").optional().isArray(),
    body("ingredients").optional().isArray()
  ],
  asyncHandler(createPizza)
);

pizzaRouter.put(
  "/:id",
  requireAuth,
  [
    body("name").optional().isString().isLength({ min: 2, max: 80 }),
    body("description").optional().isString().isLength({ max: 400 }),
    body("imageUrl").optional().isString().isLength({ max: 500 }),
    body("basePrice").optional().isFloat({ min: 0, max: 5000 }),
    body("isAvailable").optional().isBoolean(),
    body("tags").optional().isArray(),
    body("ingredients").optional().isArray()
  ],
  asyncHandler(updatePizza)
);

pizzaRouter.delete("/:id", requireAuth, asyncHandler(deletePizza));


