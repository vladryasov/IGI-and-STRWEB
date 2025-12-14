import { Router } from "express";
import { body } from "express-validator";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { createPizza, deletePizza, getPizza, listPizzas, updatePizza } from "../controllers/pizzaController.js";
import { upload } from "../middleware/upload.js";

// Обработка ошибок multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

export const pizzaRouter = Router();

pizzaRouter.get("/", asyncHandler(listPizzas)); // public
pizzaRouter.get("/:id", asyncHandler(getPizza)); // public

pizzaRouter.post(
  "/",
  requireAuth,
  upload.single("image"),
  handleMulterError,
  [
    body("name").isString().isLength({ min: 2, max: 80 }),
    body("description").optional().isString().isLength({ max: 400 }),
    body("imageUrl").optional().isString(),
    body("imageBase64").optional().isString(),
    body("basePrice").custom((value) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0 || num > 5000) {
        throw new Error("Base price must be between 0 and 5000");
      }
      return true;
    }),
    body("isAvailable").optional().custom((value) => {
      if (value === 'true' || value === 'false' || value === true || value === false) return true;
      throw new Error("isAvailable must be boolean");
    }),
    body("tags").optional().custom((value) => {
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch {
          throw new Error("tags must be valid JSON array");
        }
      }
      return true;
    }),
    body("ingredients").optional().custom((value) => {
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch {
          throw new Error("ingredients must be valid JSON array");
        }
      }
      return true;
    })
  ],
  asyncHandler(createPizza)
);

pizzaRouter.put(
  "/:id",
  requireAuth,
  upload.single("image"),
  handleMulterError,
  [
    body("name").optional().isString().isLength({ min: 2, max: 80 }),
    body("description").optional().isString().isLength({ max: 400 }),
    body("imageUrl").optional().isString(),
    body("imageBase64").optional().isString(),
    body("basePrice").optional().custom((value) => {
      if (value === undefined) return true;
      const num = parseFloat(value);
      if (isNaN(num) || num < 0 || num > 5000) {
        throw new Error("Base price must be between 0 and 5000");
      }
      return true;
    }),
    body("isAvailable").optional().custom((value) => {
      if (value === undefined) return true;
      if (value === 'true' || value === 'false' || value === true || value === false) return true;
      throw new Error("isAvailable must be boolean");
    }),
    body("tags").optional().custom((value) => {
      if (value === undefined) return true;
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch {
          throw new Error("tags must be valid JSON array");
        }
      }
      return true;
    }),
    body("ingredients").optional().custom((value) => {
      if (value === undefined) return true;
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch {
          throw new Error("ingredients must be valid JSON array");
        }
      }
      return true;
    })
  ],
  asyncHandler(updatePizza)
);

pizzaRouter.delete("/:id", requireAuth, asyncHandler(deletePizza));


