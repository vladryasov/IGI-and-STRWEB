import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { connectDB } from "./config/db.js";
import { configurePassport } from "./config/passport.js";
import { createApp } from "./app.js";

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI. Copy server/env.example -> server/.env and set variables.");
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET. Copy server/env.example -> server/.env and set variables.");
  }

  await connectDB(process.env.MONGO_URI);
  configurePassport();
  const app = createApp();

  // ensure passport is imported (strategy registration happens in configurePassport)
  void passport;

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API running on http://localhost:${PORT}`);
  });
}

bootstrap().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});



