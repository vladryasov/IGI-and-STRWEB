import { validationResult } from "express-validator";
import { Order } from "../models/Order.js";
import { getClientTimeZone, formatUtcAndTz } from "../utils/time.js";

const AUTO_CANCEL_MS = 2 * 60 * 1000; // demo for lab: 2 min

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function listMyOrders(req, res) {
  const { sort = "createdAt", dir = "desc", status } = req.query;
  const filter = { user: req.user.id };
  if (status) filter.status = status;
  const sortObj = { [sort]: dir === "asc" ? 1 : -1 };
  const tz = getClientTimeZone(req);

  const items = await Order.find(filter).populate("items.pizza items.extraIngredients").sort(sortObj).limit(200);
  const mapped = items.map(o => ({
    ...o.toObject(),
    createdAtView: formatUtcAndTz(o.createdAt, tz),
    updatedAtView: formatUtcAndTz(o.updatedAt, tz)
  }));
  res.json({ items: mapped });
}

export async function createOrder(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const order = await Order.create({
    user: req.user.id,
    items: req.body.items,
    deliveryAddress: req.body.deliveryAddress,
    promoCode: req.body.promoCode || ""
  });

  // setTimeout demo: auto-cancel if still "created" after AUTO_CANCEL_MS
  setTimeout(async () => {
    try {
      const fresh = await Order.findById(order._id);
      if (fresh && fresh.status === "created") {
        fresh.status = "cancelled";
        await fresh.save();
      }
    } catch {
      // ignore for demo
    }
  }, AUTO_CANCEL_MS);

  res.status(201).json({ order });
}

export async function getOrder(req, res) {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id }).populate(
    "items.pizza items.extraIngredients"
  );
  if (!order) return res.status(404).json({ message: "Order not found" });
  const tz = getClientTimeZone(req);
  res.json({
    order: {
      ...order.toObject(),
      createdAtView: formatUtcAndTz(order.createdAt, tz),
      updatedAtView: formatUtcAndTz(order.updatedAt, tz)
    }
  });
}

export async function cancelOrder(req, res) {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (["delivered", "cancelled"].includes(order.status)) {
    return res.status(400).json({ message: "Cannot cancel in current status" });
  }
  order.status = "cancelled";
  await order.save();
  res.json({ order });
}

export async function updateOrder(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (["delivered", "cancelled"].includes(order.status)) {
    return res.status(400).json({ message: "Cannot update in current status" });
  }

  const { deliveryAddress, promoCode, items } = req.body;
  if (typeof deliveryAddress === "string") order.deliveryAddress = deliveryAddress;
  if (typeof promoCode === "string") order.promoCode = promoCode;
  if (Array.isArray(items) && items.length > 0) order.items = items;

  await order.save();
  res.json({ order });
}

export async function deleteOrder(req, res) {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
  if (!order) return res.status(404).json({ message: "Order not found" });

  // for lab: allow delete only if order not delivered
  if (order.status === "delivered") {
    return res.status(400).json({ message: "Cannot delete delivered order" });
  }

  await Order.deleteOne({ _id: order._id });
  res.json({ ok: true });
}

// Promise/async-await chain: ingredients -> cooking -> packing -> delivery
export async function processOrder(req, res) {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.status === "cancelled") return res.status(400).json({ message: "Order cancelled" });

  async function step(nextStatus, delayMs) {
    order.status = nextStatus;
    await order.save();
    await sleep(delayMs);
  }

  await step("confirmed", 500);
  await step("cooking", 800);
  await step("packed", 600);
  await step("delivering", 30000);

  // simulate courier moving
  order.courierLocation = { lat: 50.4501 + Math.random() / 100, lng: 30.5234 + Math.random() / 100 };
  await order.save();

  await step("delivered", 300);
  res.json({ order });
}

// For XMLHttpRequest tracking: return status + courier coords
export async function trackOrder(req, res) {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id }).select(
    "status courierLocation updatedAt createdAt"
  );
  if (!order) return res.status(404).json({ message: "Order not found" });

  // small random movement while delivering (demo)
  if (order.status === "delivering") {
    order.courierLocation.lat += (Math.random() - 0.5) / 1000;
    order.courierLocation.lng += (Math.random() - 0.5) / 1000;
    await order.save();
  }

  const tz = getClientTimeZone(req);
  res.json({
    status: order.status,
    courierLocation: order.courierLocation,
    updatedAtView: formatUtcAndTz(order.updatedAt, tz),
    createdAtView: formatUtcAndTz(order.createdAt, tz)
  });
}


