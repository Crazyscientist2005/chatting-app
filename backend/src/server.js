import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server as IOServer } from "socket.io";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import connectDB from "./lib/db.js";
import { protectRoute } from "./middleware/protectRoute.js";
import arcjetProtection from "./middleware/arcjetProtection.js";

// Initialize environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(arcjetProtection);

// Connect to MongoDB
connectDB();

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/message", protectRoute, messageRoutes);

// Serve React build in production
const staticPath = path.join(__dirname, "../../frontend/vite-project/dist");
app.use(express.static(staticPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

const PORT = process.env.PORT || 5001;
const httpServer = http.createServer(app);
const io = new IOServer(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === "production" ? true : ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  },
});

// Track online users: Map<userId, socketId>
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(userId); // join personal room so io.to(userId).emit() works
    onlineUsers.set(userId, socket.id);
    // Broadcast updated online list to everyone
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  }

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    if (userId) {
      onlineUsers.delete(userId);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    }
  });
});

// Export io for use in controllers
export { io };

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});