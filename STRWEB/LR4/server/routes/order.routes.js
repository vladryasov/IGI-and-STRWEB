import { Router } from "express";
import { body } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  cancelOrder,
  createOrder,
  deleteOrder,
  getOrder,
  listMyOrders,
  processOrder,
  trackOrder,
  updateOrder
} from "../controllers/orderController.js";

export const orderRouter = Router();

orderRouter.get("/", requireAuth, asyncHandler(listMyOrders));
orderRouter.post(
  "/",
  requireAuth,
  [
    body("deliveryAddress").isString().isLength({ min: 5, max: 200 }),
    body("promoCode").optional().isString().isLength({ max: 30 }),
    body("items").isArray({ min: 1 }),
    body("items.*.pizza").isString(),
    body("items.*.quantity").isInt({ min: 1, max: 20 }),
    body("items.*.size").optional().isIn(["S", "M", "L"]),
    body("items.*.extraIngredients").optional().isArray()
  ],
  asyncHandler(createOrder)
);

orderRouter.get("/:id", requireAuth, asyncHandler(getOrder));
orderRouter.put(
  "/:id",
  requireAuth,
  [
    body("deliveryAddress").optional().isString().isLength({ min: 5, max: 200 }),
    body("promoCode").optional().isString().isLength({ max: 30 }),
    body("items").optional().isArray({ min: 1 }),
    body("items.*.pizza").optional().isString(),
    body("items.*.quantity").optional().isInt({ min: 1, max: 20 }),
    body("items.*.size").optional().isIn(["S", "M", "L"]),
    body("items.*.extraIngredients").optional().isArray()
  ],
  asyncHandler(updateOrder)
);
orderRouter.post("/:id/cancel", requireAuth, asyncHandler(cancelOrder));
orderRouter.post("/:id/process", requireAuth, asyncHandler(processOrder));
orderRouter.get("/:id/track", requireAuth, asyncHandler(trackOrder));
orderRouter.delete("/:id", requireAuth, asyncHandler(deleteOrder));


