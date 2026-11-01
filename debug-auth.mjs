import "dotenv/config";
import express from "express";
import { auth } from "./config/auth.js";

const app = express();
app.use(express.json());
app.use("/api/auth", async (req, res, next) => {
  try {
    const url = `http://${req.get("host")}${req.originalUrl}`;
    const headers = new Headers();
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      const [k, v] = [req.rawHeaders[i], req.rawHeaders[i + 1]];
      headers.append(k, v);
    }
    const request = new Request(url, {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body ?? {}),
    });
    const response = await auth.handler(request);
    const body = await response.text();
    res.status(response.status);
    response.headers.forEach((v, k) => res.setHeader(k, v));
    res.send(body);
  } catch (err) {
    console.error("DEBUG HANDLER THREW:", err);
    next(err);
  }
});

const server = app.listen(5099, async () => {
  const res = await fetch("http://localhost:5099/api/auth/sign-up/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Test User", email: "test-user-xyz@example.com", password: "password123" }),
  });
  console.log("STATUS", res.status);
  console.log("BODY", await res.text());
  server.close();
  process.exit(0);
});
