import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { auth } from "./config/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { booksRouter } from "./routes/books.js";
import { borrowsRouter } from "./routes/borrows.js";
import { uploadRouter } from "./routes/upload.js";

dotenv.config();

async function main() {
  await connectDB();

  const app = express();
  const port = process.env.PORT ?? 5000;

  app.use(cors({
    origin: process.env.CLIENT_URL ?? "*",
    credentials: true,
  }));
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ ok: true });
  });

  // Better Auth endpoints (sign-in, sign-up, session, jwks, google, …)
  app.use("/api/auth", auth.handler);

  // BookNook API routes
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
