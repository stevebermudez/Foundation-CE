import passport from "passport";
// @ts-ignore
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// @ts-ignore
import { Strategy as FacebookStrategy } from "passport-facebook";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

async function upsertUser(profile: any, email?: string) {
  const userId = `${profile.provider}:${profile.id}`;
  await storage.upsertUser({
    id: userId,
    email: email || profile.emails?.[0]?.value,
    firstName: profile.name?.givenName || profile.given_name || profile.displayName?.split(" ")[0],
    lastName: profile.name?.familyName || profile.family_name || profile.displayName?.split(" ")[1],
    profileImageUrl: profile.photos?.[0]?.value || profile.picture,
  });
  return userId;
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/google/callback",
        },
        async (accessToken: any, refreshToken: any, profile: any, done: any) => {
          try {
            const userId = await upsertUser(profile);
            return done(null, { id: userId });
          } catch (err) {
            return done(err);
          }
        }
      )
    );

    app.get("/api/google/login", passport.authenticate("google", { scope: ["profile", "email"] }));
    app.get(
      "/api/google/callback",
      passport.authenticate("google", { failureRedirect: "/login" }),
      (req, res) => res.redirect("/dashboard")
    );
  } else {
    app.get("/api/google/login", (req, res) => {
      res.status(500).json({ error: "Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET." });
    });
  }

  // Facebook OAuth
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: "/api/facebook/callback",
          profileFields: ["id", "displayName", "photos", "email", "name"],
        },
        async (accessToken: any, refreshToken: any, profile: any, done: any) => {
          try {
            const userId = await upsertUser(profile);
            return done(null, { id: userId });
          } catch (err) {
            return done(err);
          }
        }
      )
    );

    app.get("/api/facebook/login", passport.authenticate("facebook", { scope: ["email"] }));
    app.get(
      "/api/facebook/callback",
      passport.authenticate("facebook", { failureRedirect: "/login" }),
      (req, res) => res.redirect("/dashboard")
    );
  } else {
    app.get("/api/facebook/login", (req, res) => {
      res.status(500).json({ error: "Facebook OAuth not configured. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET." });
    });
  }

  // Microsoft OAuth - Coming soon, requires additional setup
  app.get("/api/microsoft/login", (req, res) => {
    res.status(501).json({ error: "Microsoft login coming soon" });
  });

  passport.serializeUser((user: any, cb) => cb(null, user.id));
  passport.deserializeUser(async (userId: string, cb) => {
    try {
      const user = await storage.getUser(userId);
      if (user) {
        cb(null, { id: userId, ...user });
      } else {
        cb(null, { id: userId });
      }
    } catch (err) {
      console.error("Error deserializing user:", err);
      cb(null, { id: userId });
    }
  });

  // Logout
  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
