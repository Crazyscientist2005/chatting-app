import multer from "multer";

// Store files in memory so we can forward the buffer to Cloudinary
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit per user preference
});
