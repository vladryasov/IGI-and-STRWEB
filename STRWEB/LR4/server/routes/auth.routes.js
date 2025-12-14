import { Router } from "express";
import passport from "passport";
import { body } from "express-validator";
import { login, me, register, googleCallback } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  [
    body("name").isString().isLength({ min: 2, max: 60 }),
    body("email").isEmail(),
    body("password").isString().isLength({ min: 6, max: 100 })
  ],
  asyncHandler(register)
);

authRouter.post(
  "/login",
  [body("email").isEmail(), body("password").isString().isLength({ min: 1, max: 100 })],
  asyncHandler(login)
);

authRouter.get("/me", requireAuth, asyncHandler(me));

// Google OAuth (optional)
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/api/health" }),
  googleCallback
);


