import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as MicrosoftStrategy } from "passport-microsoft-graph";
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

async function upsertUser(profile: any) {
  const userId = `${profile.provider}:${profile.id}`;
  await storage.upsertUser({
    id: userId,
    email: profile.emails?.[0]?.value,
    firstName: profile.name?.givenName || profile.given_name,
    lastName: profile.name?.familyName || profile.family_name,
    profileImageUrl: profile.photos?.[0]?.value || profile.picture,
  });
  return userId;
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const getCallbackURL = (provider: string) => {
    return process.env.CALLBACK_URL || `http://localhost:5000/api/${provider}/callback`;
  };

  // Google OAuth
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: getCallbackURL("google"),
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const userId = await upsertUser(profile);
          return done(null, { id: userId, profile });
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Facebook OAuth
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID!,
        clientSecret: process.env.FACEBOOK_APP_SECRET!,
        callbackURL: getCallbackURL("facebook"),
        profileFields: ["id", "displayName", "photos", "email", "name"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const userId = await upsertUser(profile);
          return done(null, { id: userId, profile });
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Microsoft OAuth
  passport.use(
    new MicrosoftStrategy(
      {
        clientID: process.env.MICROSOFT_CLIENT_ID!,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
        callbackURL: getCallbackURL("microsoft"),
        scope: ["user.read"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const userId = await upsertUser(profile);
          return done(null, { id: userId, profile });
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Google Auth Routes
  app.get("/api/google/login", passport.authenticate("google", { scope: ["profile", "email"] }));
  app.get(
    "/api/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => res.redirect("/dashboard")
  );

  // Facebook Auth Routes
  app.get("/api/facebook/login", passport.authenticate("facebook", { scope: ["email"] }));
  app.get(
    "/api/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/login" }),
    (req, res) => res.redirect("/dashboard")
  );

  // Microsoft Auth Routes
  app.get(
    "/api/microsoft/login",
    passport.authenticate("microsoft", { scope: ["user.read"] })
  );
  app.get(
    "/api/microsoft/callback",
    passport.authenticate("microsoft", { failureRedirect: "/login" }),
    (req, res) => res.redirect("/dashboard")
  );

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
