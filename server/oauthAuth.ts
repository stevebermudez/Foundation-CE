import passport from "passport";
// @ts-ignore
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// @ts-ignore
import { Strategy as AppleStrategy } from "passport-apple";
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

  // Debug: Log all OAuth env vars
  console.log("🔍 OAuth Environment Variables Debug:");
  console.log("GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);
  if (process.env.GOOGLE_CLIENT_ID) {
    console.log("GOOGLE_CLIENT_ID starts with:", process.env.GOOGLE_CLIENT_ID.substring(0, 20));
  }
  console.log("GOOGLE_CLIENT_SECRET exists:", !!process.env.GOOGLE_CLIENT_SECRET);
  if (process.env.GOOGLE_CLIENT_SECRET) {
    console.log("GOOGLE_CLIENT_SECRET starts with:", process.env.GOOGLE_CLIENT_SECRET.substring(0, 20));
  }

  // Google OAuth
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log("✅ Setting up Google OAuth Strategy");
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

  // Apple OAuth
  if (process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY && process.env.APPLE_BUNDLE_ID) {
    passport.use(
      new AppleStrategy(
        {
          teamID: process.env.APPLE_TEAM_ID,
          keyID: process.env.APPLE_KEY_ID,
          privateKeyPath: process.env.APPLE_PRIVATE_KEY_PATH || undefined,
          privateKeyString: process.env.APPLE_PRIVATE_KEY,
          bundleID: process.env.APPLE_BUNDLE_ID,
          callbackURL: "/api/apple/callback",
        },
        async (accessToken: any, refreshToken: any, idToken: any, profile: any, done: any) => {
          try {
            const userId = await upsertUser(profile);
            return done(null, { id: userId });
          } catch (err) {
            return done(err);
          }
        }
      )
    );

    app.post("/api/apple/login", passport.authenticate("apple"));
    app.post(
      "/api/apple/callback",
      passport.authenticate("apple", { failureRedirect: "/login" }),
      (req, res) => res.redirect("/dashboard")
    );
  } else {
    app.post("/api/apple/login", (req, res) => {
      res.status(500).json({ error: "Apple Sign In not configured. Please set APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY, and APPLE_BUNDLE_ID." });
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
        cb(null, user);
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

export const isAdmin: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = req.user as any;
  try {
    const isAdminUser = await storage.isAdmin(user.id);
    if (isAdminUser) {
      return next();
    }
    res.status(403).json({ message: "Forbidden - Admin access required" });
  } catch (err) {
    console.error("Error checking admin status:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
