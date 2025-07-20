import express from "express";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import cors from "cors";

// Create Express app factory
export const createApp = () => {
const app = express();
const prisma = new PrismaClient();

app.use(
cors({
origin: "http://localhost:5173",
credentials: true,
})
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Basic Express route
app.get("/", (req, res) => {
res.json({ message: "Server is running!" });
});

// Health check endpoint
app.get("/health", async (req, res) => {
try {
await prisma.$queryRaw`SELECT NOW()`;
res.json({ status: "healthy", database: "connected" });
} catch (error) {
res.status(500).json({ status: "unhealthy", error: error.message });
}
});

return app;
};

// Store connected users
const connectedUsers = new Map();

// Socket.io connection handler
export const handleSocketConnection = (socket, io) => {
  console.log('User connected:', socket.id)

  // listen for incoming messages from this socket
  socket.on('message', (data) => {
    console.log('message: ' + data.text)
    io.emit('message', data)
    // broadcast message to all connected clientts
    // socket.broadcast.emit('chat message', data)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
}
