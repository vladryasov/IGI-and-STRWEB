import { validationResult } from "express-validator";
import { Pizza } from "../models/Pizza.js";

export async function listPizzas(req, res) {
  const { q = "", sort = "createdAt", dir = "desc", available } = req.query;
  const filter = {};
  if (available === "true") filter.isAvailable = true;
  if (available === "false") filter.isAvailable = false;

  if (q) {
    filter.$or = [
      { name: { $regex: String(q), $options: "i" } },
      { description: { $regex: String(q), $options: "i" } },
      { tags: { $regex: String(q), $options: "i" } }
    ];
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
  
  const pizzaData = {
    name: req.body.name,
    description: req.body.description || "",
    basePrice: parseFloat(req.body.basePrice) || 0,
    isAvailable: req.body.isAvailable === 'true' || req.body.isAvailable === true,
    tags: req.body.tags ? (typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags) : [],
    ingredients: req.body.ingredients ? (typeof req.body.ingredients === 'string' ? JSON.parse(req.body.ingredients) : req.body.ingredients) : []
  };
  
  // Если загружен файл, сохраняем путь к нему
  if (req.file) {
    pizzaData.imageUrl = `/uploads/${req.file.filename}`;
  }
  // Если пришла base64 строка (data URL), сохраняем её
  else if (req.body.imageBase64 && req.body.imageBase64.startsWith('data:')) {
    pizzaData.imageUrl = req.body.imageBase64;
  }
  
  const item = await Pizza.create(pizzaData);
  res.status(201).json({ item });
}

export async function updatePizza(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
  const pizzaData = {};
  if (req.body.name) pizzaData.name = req.body.name;
  if (req.body.description !== undefined) pizzaData.description = req.body.description;
  if (req.body.basePrice !== undefined) pizzaData.basePrice = parseFloat(req.body.basePrice);
  if (req.body.isAvailable !== undefined) {
    pizzaData.isAvailable = req.body.isAvailable === 'true' || req.body.isAvailable === true;
  }
  if (req.body.tags !== undefined) {
    pizzaData.tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
  }
  if (req.body.ingredients !== undefined) {
    pizzaData.ingredients = typeof req.body.ingredients === 'string' ? JSON.parse(req.body.ingredients) : req.body.ingredients;
  }
  
  // Если загружен файл, сохраняем путь к нему
  if (req.file) {
    pizzaData.imageUrl = `/uploads/${req.file.filename}`;
  }
  // Если пришла base64 строка (data URL), сохраняем её
  else if (req.body.imageBase64 && req.body.imageBase64.startsWith('data:')) {
    pizzaData.imageUrl = req.body.imageBase64;
  }
  // Если передается imageUrl напрямую (например, при сохранении без изменений)
  else if (req.body.imageUrl) {
    pizzaData.imageUrl = req.body.imageUrl;
  }
  
  const item = await Pizza.findByIdAndUpdate(req.params.id, pizzaData, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: "Pizza not found" });
  res.json({ item });
}

export async function deletePizza(req, res) {
  const item = await Pizza.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "Pizza not found" });
  res.json({ ok: true });
}



