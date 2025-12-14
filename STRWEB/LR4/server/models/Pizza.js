import mongoose from "mongoose";

const PizzaSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true, minlength: 2, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 400, default: "" },
    imageUrl: { type: String, trim: true, default: "" },
    basePrice: { type: Number, required: true, min: 0, max: 5000 },
    isAvailable: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
    ingredients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" }]
  },
  { timestamps: true }
);

PizzaSchema.index({ name: "text", description: "text", tags: "text" });

export const Pizza = mongoose.model("Pizza", PizzaSchema);



