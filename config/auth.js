import { betterAuth } from "better-auth";
import { bearer, jwt } from "better-auth/plugins";
import { mongoAdapter } from "@better-auth/mongo-adapter";

export const auth = betterAuth({
  database: mongoAdapter({
    uri: process.env.DB_URL,
    databaseName: process.env.DB_NAME,
  }),
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
    // Allows the frontend to send `Authorization: Bearer <token>` and have
    // Better Auth treat it as the session token.
    bearer({ requireSignature: true }),
    // Issues and verifies signed JWTs for sessions (used by the Express API).
    jwt({
      jwt: {
        issuer: process.env.JWT_ISSUER ?? "booknook",
        audience: process.env.JWT_AUDIENCE ?? "booknook",
        expirationTime: "7 days",
      },
    }),
  ],
});
