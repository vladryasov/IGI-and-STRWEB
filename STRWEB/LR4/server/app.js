import express from "express";
import cors from "cors";
import morgan from "morgan";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import { authRouter } from "./routes/auth.routes.js";
import { pizzaRouter } from "./routes/pizza.routes.js";
import { orderRouter } from "./routes/order.routes.js";
import { ingredientRouter } from "./routes/ingredient.routes.js";
import { aiRouter } from "./routes/ai.routes.js";
import { notFound, errorHandler } from "./middleware/error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
      credentials: true
    })
  );
  app.use(morgan("dev"));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(passport.initialize());
  
  // Serve uploaded files
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  app.get("/api/health", (req, res) => res.json({ ok: true, utc: new Date().toISOString() }));

  app.use("/api/auth", authRouter);
  app.use("/api/pizzas", pizzaRouter);
  app.use("/api/ingredients", ingredientRouter);
  app.use("/api/orders", orderRouter);
  app.use("/api/ai", aiRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}



