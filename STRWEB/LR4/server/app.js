import express from "express";
import cors from "cors";
import morgan from "morgan";
import passport from "passport";

import { authRouter } from "./routes/auth.routes.js";
import { pizzaRouter } from "./routes/pizza.routes.js";
import { orderRouter } from "./routes/order.routes.js";
import { ingredientRouter } from "./routes/ingredient.routes.js";
import { aiRouter } from "./routes/ai.routes.js";
import { notFound, errorHandler } from "./middleware/error.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
      credentials: true
    })
  );
  app.use(morgan("dev"));
  app.use(express.json({ limit: "1mb" }));
  app.use(passport.initialize());

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



