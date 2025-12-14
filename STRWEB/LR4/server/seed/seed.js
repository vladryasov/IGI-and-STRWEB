import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Ingredient } from "../models/Ingredient.js";
import { Pizza } from "../models/Pizza.js";

async function upsertIngredients() {
  const base = [
    { name: "Mozzarella", price: 40, isVeg: true, allergens: ["milk"] },
    { name: "Tomato sauce", price: 15, isVeg: true, allergens: [] },
    { name: "Basil", price: 10, isVeg: true, allergens: [] },
    { name: "Pepperoni", price: 55, isVeg: false, allergens: [] },
    { name: "Mushrooms", price: 25, isVeg: true, allergens: [] },
    { name: "Olives", price: 20, isVeg: true, allergens: [] },
    { name: "Ham", price: 50, isVeg: false, allergens: [] },
    { name: "Pineapple", price: 30, isVeg: true, allergens: [] },
    { name: "Parmesan", price: 35, isVeg: true, allergens: ["milk"] },
    { name: "Chili", price: 10, isVeg: true, allergens: [] }
  ];

  const docs = [];
  for (const it of base) {
    const doc = await Ingredient.findOneAndUpdate({ name: it.name }, it, {
      new: true,
      upsert: true,
      runValidators: true
    });
    docs.push(doc);
  }
  return docs;
}

function pick(map, names) {
  const byName = new Map(map.map(i => [i.name, i._id]));
  return names.map(n => byName.get(n)).filter(Boolean);
}

async function seedPizzas(ingredients) {
  const pizzas = [
    {
      name: "Margherita",
      description: "Классика: соус, моцарелла, базилик.",
      basePrice: 180,
      tags: ["classic", "veg"],
      ingredients: pick(ingredients, ["Tomato sauce", "Mozzarella", "Basil"])
    },
    {
      name: "Pepperoni",
      description: "Острая и сочная пепперони.",
      basePrice: 240,
      tags: ["spicy"],
      ingredients: pick(ingredients, ["Tomato sauce", "Mozzarella", "Pepperoni"])
    },
    {
      name: "Funghi",
      description: "Грибы + сыр = идеально.",
      basePrice: 220,
      tags: ["veg"],
      ingredients: pick(ingredients, ["Tomato sauce", "Mozzarella", "Mushrooms"])
    },
    {
      name: "Quattro Formaggi",
      description: "Сырный праздник: моцарелла + пармезан.",
      basePrice: 260,
      tags: ["cheese"],
      ingredients: pick(ingredients, ["Tomato sauce", "Mozzarella", "Parmesan"])
    },
    {
      name: "Hawaiian",
      description: "Ветчина и ананас — спорно, но вкусно.",
      basePrice: 250,
      tags: ["sweet"],
      ingredients: pick(ingredients, ["Tomato sauce", "Mozzarella", "Ham", "Pineapple"])
    },
    {
      name: "Diavola",
      description: "Острая: пепперони + чили.",
      basePrice: 255,
      tags: ["spicy"],
      ingredients: pick(ingredients, ["Tomato sauce", "Mozzarella", "Pepperoni", "Chili"])
    },
    {
      name: "Olive Garden",
      description: "Оливки, сыр, соус — средиземноморский вайб.",
      basePrice: 230,
      tags: ["veg"],
      ingredients: pick(ingredients, ["Tomato sauce", "Mozzarella", "Olives", "Basil"])
    },
    {
      name: "Prosciutto",
      description: "Ветчина + грибы — сытно.",
      basePrice: 255,
      tags: ["meat"],
      ingredients: pick(ingredients, ["Tomato sauce", "Mozzarella", "Ham", "Mushrooms"])
    },
    {
      name: "Rustica",
      description: "Деревенская: грибы, оливки, пармезан.",
      basePrice: 245,
      tags: ["veg"],
      ingredients: pick(ingredients, ["Tomato sauce", "Mozzarella", "Mushrooms", "Olives", "Parmesan"])
    },
    {
      name: "Simple Italiano",
      description: "Минимализм: соус, сыр, базилик, пармезан.",
      basePrice: 210,
      tags: ["classic", "veg"],
      ingredients: pick(ingredients, ["Tomato sauce", "Mozzarella", "Basil", "Parmesan"])
    }
  ];

  for (const p of pizzas) {
    await Pizza.findOneAndUpdate({ name: p.name }, p, { new: true, upsert: true, runValidators: true });
  }
}

async function main() {
  if (!process.env.MONGO_URI) throw new Error("Missing MONGO_URI");
  await connectDB(process.env.MONGO_URI);

  const ingredients = await upsertIngredients();
  await seedPizzas(ingredients);

  // eslint-disable-next-line no-console
  console.log("Seed completed: ingredients & 10 pizzas");
  await mongoose.disconnect();
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});



