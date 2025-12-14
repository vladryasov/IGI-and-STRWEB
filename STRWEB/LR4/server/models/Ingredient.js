import mongoose from "mongoose";

const IngredientSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true, minlength: 2, maxlength: 40 },
    price: { type: Number, min: 0, max: 1000, required: true },
    isVeg: { type: Boolean, default: false },
    allergens: { type: [String], default: [] }
  },
  { timestamps: true }
);

IngredientSchema.index({ name: 1 }, { unique: true });

export const Ingredient = mongoose.model("Ingredient", IngredientSchema);



