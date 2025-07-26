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
      origin: process.env.PUBLIC_URL || "http://localhost:5173",
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
export const handleSocketConnection = (socket) => {
  console.log("User connected:", socket.id);

  // Handle user joining
  socket.on("user_join", (userData) => {
    const user = {
      id: socket.id,
      username: userData.username,
      userId: userData.userId,
      currentChannel: userData.channel || "general", // Default to general channel
    };
    
    connectedUsers.set(socket.id, user);

    // Join the default channel room
    socket.join(user.currentChannel);
    console.log(`${userData.username} joined room: ${user.currentChannel}`);

    // Send current users list to all users 
    const usersList = Array.from(connectedUsers.values());
    socket.emit("users_list", usersList);
    socket.broadcast.emit("users_list", usersList);

    console.log(`${userData.username} joined the chat`);
  });

  // Handle channel switching
  socket.on("join_channel", (channelData) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      const previousChannel = user.currentChannel;
      const newChannel = channelData.channel;

      // Leave the previous channel room
      if (previousChannel) {
        socket.leave(previousChannel);
        console.log(`${user.username} left room: ${previousChannel}`);
      }

      // Join the new channel room
      socket.join(newChannel);
      user.currentChannel = newChannel;

      console.log(`${user.username} joined room: ${newChannel}`);

      // Send a confirmation back to the client
      socket.emit("channel_joined", { 
        channel: newChannel, 
        previousChannel: previousChannel 
      });
    }
  });

  // Handle new chat messages
  socket.on("send_message", (messageData) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      const channel = messageData.channel || user.currentChannel || "general";
      
      const message = {
        id: Date.now() + Math.random(), // Simple ID generation
        text: messageData.text,
        username: user.username,
        userId: user.userId,
        channel: channel,
        timestamp: new Date().toISOString(),
      };

      // Send message only to users in the same channel room
      socket.to(channel).emit("receive_message", message);

      // Send back to sender for confirmation
      socket.emit("message_sent", message);

      // Send notification to users in other channels about new message to notify users who are not in the current channel
      // Get all users not in the current channel
      const allUsers = Array.from(connectedUsers.values());
      const usersInOtherChannels = allUsers.filter(u => 
        u.currentChannel !== channel && u.id !== socket.id
      );

      // Send notifications to users in other channels
      usersInOtherChannels.forEach(otherUser => {
        socket.to(otherUser.id).emit("message_notification", {
          title: `New message in #${channel}`,
          message: `${message.username}: ${message.text.substring(0, 50)}${
            message.text.length > 50 ? "..." : ""
          }`,
          channel: channel,
          messageId: message.id,
          username: message.username,
        });
      });

      console.log(
        `Message from ${user.username} in #${channel}: ${messageData.text}`
      );
    }
  });

  // Handle typing indicators
  socket.on("typing_start", (data) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      const channel = data?.channel || user.currentChannel || "general";
      // Send typing indicator only to users in the same channel
      socket.to(channel).emit("user_typing", {
        username: user.username,
        channel: channel,
        isTyping: true,
      });
    }
  });

  socket.on("typing_stop", (data) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      const channel = data?.channel || user.currentChannel || "general";
      // Send typing stop only to users in the same channel
      socket.to(channel).emit("user_typing", {
        username: user.username,
        channel: channel,
        isTyping: false,
      });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      // Leave all rooms (this happens automatically, but being explicit)
      socket.leave(user.currentChannel);
      
      connectedUsers.delete(socket.id);

      // Send updated users list to all clients
      const usersList = Array.from(connectedUsers.values());
      socket.broadcast.emit("users_list", usersList);

      console.log(`${user.username} disconnected from room: ${user.currentChannel}`);
    } else {
      console.log("User disconnected:", socket.id);
    }
  });
};