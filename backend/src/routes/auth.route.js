import express from "express";
import { login, logout, signup, check, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check", protectRoute, check);
router.put("/update-profile", protectRoute, upload.single("avatar"), updateProfile);

export default router;
