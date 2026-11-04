import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { bearer, jwt } from "better-auth/plugins";

const client = new MongoClient(process.env.DB_URL);
const db = client.db(process.env.DB_NAME);

// SameSite=None is required so the browser sends the session cookie on
// cross-origin fetch requests (frontend and backend are on different Vercel
// subdomains). SameSite=None mandates Secure=true, which Better Auth sets
// automatically when baseURL is HTTPS (sets the __Secure- cookie prefix).
// In local development over HTTP, SameSite=Lax is kept because Secure cookies
// do not work over http://localhost.
// On Vercel, the app is always served over HTTPS (VERCEL=1). Use that signal
// in addition to BETTER_AUTH_URL so SameSite=None is applied even when
// BETTER_AUTH_URL is not explicitly set in the environment.
const isProduction = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
const betterAuthUrl = process.env.BETTER_AUTH_URL ?? "";
const isSecureOrigin = isProduction || betterAuthUrl.startsWith("https://");

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,

  database: mongodbAdapter(db, { client }),

  trustedOrigins: [
    "http://localhost:3000",
    process.env.CLIENT_URL,
  ].filter(Boolean),

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },

  plugins: [
    bearer({ requireSignature: true }),

    jwt({
      jwt: {
        issuer: process.env.JWT_ISSUER ?? "booknook",
        audience: process.env.JWT_AUDIENCE ?? "booknook",
        expirationTime: "7 days",
      },
    }),
  ],

  advanced: {
    defaultCookieAttributes: {
      sameSite: isSecureOrigin ? "none" : "lax",
    },
  },
});