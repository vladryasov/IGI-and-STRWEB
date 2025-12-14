import { validationResult } from "express-validator";
import { Pizza } from "../models/Pizza.js";

export async function listPizzas(req, res) {
  const { q = "", sort = "createdAt", dir = "desc", available } = req.query;
  const filter = {};
  if (available === "true") filter.isAvailable = true;
  if (available === "false") filter.isAvailable = false;

  if (q) {
    filter.$text = { $search: String(q) };
  }

  const sortObj = { [sort]: dir === "asc" ? 1 : -1 };
  const items = await Pizza.find(filter)
    .populate("ingredients")
    .sort(sortObj)
    .limit(200);

  res.json({ items });
}

export async function getPizza(req, res) {
  const item = await Pizza.findById(req.params.id).populate("ingredients");
  if (!item) return res.status(404).json({ message: "Pizza not found" });
  res.json({ item });
}

export async function createPizza(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const item = await Pizza.create(req.body);
  res.status(201).json({ item });
}

export async function updatePizza(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const item = await Pizza.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: "Pizza not found" });
  res.json({ item });
}

export async function deletePizza(req, res) {
  const item = await Pizza.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "Pizza not found" });
  res.json({ ok: true });
}



