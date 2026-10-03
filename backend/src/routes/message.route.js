import express from "express";
import { getContacts, getChats, getMessages, sendMessage } from "../controllers/message.controller.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// All routes are already protected by protectRoute at server level
router.get("/contacts", getContacts);
router.get("/chats", getChats);
router.get("/:id", getMessages);
router.post("/send/:id", upload.single("image"), sendMessage);

export default router;
