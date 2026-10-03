import { aj } from "../lib/arcjet.js";

/**
 * Arcjet protection middleware. Applies rate‑limiting to every request.
 * If the request exceeds the limit, Arcjet will throw an error which we
 * translate into a 429 response. `failOpen: true` lets the request pass
 * when Arcjet is unavailable.
 */
export default async function arcjetProtection(req, res, next) {
  try {
    await aj.protect(req, { failOpen: true });
    next();
  } catch (err) {
    console.error("Arcjet limit exceeded:", err);
    res.status(429).json({ message: "Too many requests – please try again later." });
  }
}
