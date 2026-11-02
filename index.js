import express from "express";
import cors from "cors";
import "dotenv/config";

import { toNodeHandler } from "better-auth/node";

import { connectDB } from "./config/db.js";
import { auth } from "./config/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

import { booksRouter } from "./routes/books.js";
import { borrowsRouter } from "./routes/borrows.js";
import uploadRouter from "./routes/upload.js";

async function main() {
  await connectDB();

  const app = express();
  const port = process.env.PORT || 5000;

  app.use(cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:3000",
    credentials: true,
  }));

  app.get("/health", (req, res) => {
    res.json({ ok: true });
  });

  // Better Auth MUST come before express.json()
  app.all("/api/auth/{*any}", toNodeHandler(auth));

  app.use(express.json());

  app.use("/api/books", booksRouter);
  app.use("/api/borrows", borrowsRouter);
  app.use("/api/upload", uploadRouter);

  app.use(errorHandler);

  app.listen(port, () => {
    console.log(`BookNook API listening on port ${port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});