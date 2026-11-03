
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

const app = express();

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ?? "http://localhost:3000",
    credentials: true,
  })
);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Better Auth
app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());

// Connect MongoDB before database routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// API Routes
app.use("/api/books", booksRouter);
app.use("/api/borrows", borrowsRouter);
app.use("/api/upload", uploadRouter);

app.use(errorHandler);

// Local development only
if (!process.env.VERCEL) {
  const port = process.env.PORT || 5000;

  app.listen(port, () => {
    console.log(`BookNook API running on port ${port}`);
  });
}

export default app;
