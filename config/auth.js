import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { bearer, jwt } from "better-auth/plugins";

const client = new MongoClient(process.env.DB_URL);
const db = client.db(process.env.DB_NAME);

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
trustedOrigins: [
  "http://localhost:3000",
],
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
});