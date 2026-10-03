import Message from "../models/message.js";
import User from "../models/user.js";
import { uploadImage } from "../lib/cloudinary.js";
import { io } from "../server.js";

/** Get contacts: all users except the requester */
export const getContacts = async (req, res) => {
  try {
    const contacts = await User.find({ _id: { $ne: req.user._id } }).select("-passwordHash");
    res.json(contacts);
  } catch (err) {
    console.error("getContacts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/** Get list of chat partners (unique other user IDs from messages) */
export const getChats = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    }).select("sender receiver");
    const partnerIds = new Set();
    messages.forEach((msg) => {
      if (msg.sender.toString() !== req.user._id.toString())
        partnerIds.add(msg.sender.toString());
      if (msg.receiver.toString() !== req.user._id.toString())
        partnerIds.add(msg.receiver.toString());
    });
    const partners = await User.find({
      _id: { $in: Array.from(partnerIds) },
    }).select("-passwordHash");
    res.json(partners);
  } catch (err) {
    console.error("getChats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/** Get all messages between requester and a specific user */
export const getMessages = async (req, res) => {
  try {
    const otherId = req.params.id;
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: otherId },
        { sender: otherId, receiver: req.user._id },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/** Send a new message (text and/or image) */
export const sendMessage = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const { text } = req.body;
    let imageUrl;
    if (req.file) {
      imageUrl = await uploadImage(req.file.buffer);
    }
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      text: text || undefined,
      imageUrl,
    });

    // Emit to the receiver's socket room (userId is used as room key)
    io.to(receiverId).emit("newMessage", message);

    res.status(201).json({ message });
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
