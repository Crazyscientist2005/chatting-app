import arcjet, { tokenBucket } from "@arcjet/node";
import dotenv from "dotenv";

dotenv.config();

// Default rate limit: 100 requests per minute per IP
export const aj = arcjet({
  key: process.env.ARCKET_KEY || "ajkey_placeholder",
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 100,
      interval: "1m",
      capacity: 100,
    }),
  ],
});
