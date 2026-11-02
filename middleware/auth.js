import { createRemoteJWKSet, jwtVerify } from "jose";
import "dotenv/config";
const jwksUrl = new URL(
  `${process.env.BETTER_AUTH_URL ?? "http://localhost:5000"}/api/auth/jwks`
);
const jwks = createRemoteJWKSet(jwksUrl);

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing authentication token" });
  }

  const token = header.slice("Bearer ".length);

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: process.env.JWT_ISSUER ?? "booknook",
      audience: process.env.JWT_AUDIENCE ?? "booknook",
    });

    // jwtVerify validates the signature, issuer, audience and expiry.
    // The user id is taken from the verified token subject.
    req.userId = payload.sub;
    req.userEmail = payload.email ?? null;
    req.userName = payload.name ?? payload.email ?? null;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
