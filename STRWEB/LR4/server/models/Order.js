import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    pizza: { type: mongoose.Schema.Types.ObjectId, ref: "Pizza", required: true },
    size: { type: String, enum: ["S", "M", "L"], default: "M" },
    quantity: { type: Number, min: 1, max: 20, required: true },
    extraIngredients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" }],
    note: { type: String, trim: true, maxlength: 200, default: "" }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [OrderItemSchema], validate: v => Array.isArray(v) && v.length > 0 },
    status: {
      type: String,
      enum: ["created", "confirmed", "cooking", "packed", "delivering", "delivered", "cancelled"],
      default: "created",
      index: true
    },
    deliveryAddress: { type: String, trim: true, minlength: 5, maxlength: 200, required: true },
    promoCode: { type: String, trim: true, maxlength: 30, default: "" },
    courierLocation: {
      lat: { type: Number, min: -90, max: 90, default: 0 },
      lng: { type: Number, min: -180, max: 180, default: 0 }
    }
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", OrderSchema);



