import { validationResult } from "express-validator";
import { Ingredient } from "../models/Ingredient.js";

export async function listIngredients(req, res) {
  const { q = "", sort = "name", dir = "asc" } = req.query;
  const filter = q ? { name: { $regex: String(q), $options: "i" } } : {};
  const sortObj = { [sort]: dir === "desc" ? -1 : 1 };
  const items = await Ingredient.find(filter).sort(sortObj).limit(200);
  res.json({ items });
}

export async function createIngredient(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const item = await Ingredient.create(req.body);
  res.status(201).json({ item });
}

export async function updateIngredient(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const item = await Ingredient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: "Ingredient not found" });
  res.json({ item });
}

export async function deleteIngredient(req, res) {
  const item = await Ingredient.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "Ingredient not found" });
  res.json({ ok: true });
}



