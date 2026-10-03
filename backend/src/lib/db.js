import mongoose from "mongoose";
import dns from "dns";

// Set fallback public DNS servers for Windows SRV lookup support
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  // Ignore if custom DNS cannot be set
}

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI not defined in environment variables");
    }
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully 🎉");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
