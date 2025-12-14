import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/User.js";

export function configurePassport() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
    // OAuth is optional for the lab; API will still work with JWT login/register
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile?.emails?.[0]?.value?.toLowerCase() || "";
          const name = profile?.displayName || "Google User";
          const googleId = profile?.id;

          let user =
            (googleId ? await User.findOne({ googleId }) : null) ||
            (email ? await User.findOne({ email }) : null);

          if (!user) {
            user = await User.create({ name, email, googleId, role: "user" });
          } else if (!user.googleId && googleId) {
            user.googleId = googleId;
            await user.save();
          }

          return done(null, user);
        } catch (e) {
          return done(e);
        }
      }
    )
  );
}



