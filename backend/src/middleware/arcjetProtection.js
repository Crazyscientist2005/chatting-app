import { aj } from "../lib/arcjet.js";

/**
 * Arcjet protection middleware.
 * If Arcjet key is missing or dummy, passes through.
 * If Arcjet fails due to reverse proxy IP headers, fails open so users aren't blocked.
 */
export default async function arcjetProtection(req, res, next) {
  if (
    !process.env.ARCKET_KEY ||
    process.env.ARCKET_KEY.includes("dummy") ||
    process.env.ARCKET_KEY.includes("placeholder")
  ) {
    return next();
  }

  try {
    const decision = await aj.protect(req, { requested: 1 });
    if (decision && decision.isDenied()) {
      return res.status(429).json({ message: "Too many requests – please try again later." });
    }
    next();
  } catch (err) {
    console.warn("Arcjet bypass (failing open):", err.message || err);
    next();
  }
}
