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

  // Return both app and prisma
  return { app, prisma };
};

// Store connected users by userId to prevent duplicates
const connectedUsers = new Map();
const usersByUserId = new Map();

// Helper function to get channel name by ID
const getChannelName = async (prisma, channelId) => {
  try {
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      select: { name: true },
    });
    return channel?.name || channelId; // Fallback to ID if name not found
  } catch (error) {
    console.error("Error fetching channel name:", error);
    return channelId; // Fallback to ID on error
  }
};

// Socket.io connection handler
export const handleSocketConnection = (socket, io, prisma) => {
  // Handle user joining
  socket.on("user_join", async (userData) => {
    const existingSocketId = usersByUserId.get(userData.userId);
    if (existingSocketId && existingSocketId !== socket.id) {
      const existingSocket = io.sockets.sockets.get(existingSocketId);
      if (existingSocket) {
        existingSocket.disconnect(true);
      }
      connectedUsers.delete(existingSocketId);
      usersByUserId.delete(userData.userId);
    }

    const user = {
      id: socket.id,
      username: userData.username,
      userId: userData.userId,
      currentChannel: userData.channel,
    };

    connectedUsers.set(socket.id, user);
    usersByUserId.set(userData.userId, socket.id);

    let actualChannelId = user.currentChannel;
    let channelName = "general"; // Default channel name

    // If the current channel is "general" (string), find the actual ID
    if (user.currentChannel === "general") {
      try {
        const generalChannel = await prisma.channel.findFirst({
          where: { name: "general" },
          select: { id: true, name: true },
        });
        if (generalChannel) {
          actualChannelId = generalChannel.id;
          channelName = generalChannel.name;
        } else {
          console.warn(
            "Default 'general' channel not found in DB. Please ensure it's seeded."
          );
        }
      } catch (error) {
        console.error("Error fetching general channel ID:", error);
      }
    } else {
      // If it's already an ID, get the channel name
      channelName = await getChannelName(prisma, user.currentChannel);
    }

    user.currentChannel = actualChannelId; // Store the ID internally
    user.currentChannelName = channelName; // Store the name for display

    // Join the channel room
    socket.join(user.currentChannel);
    console.log(
      `${userData.username} joined room: #${channelName} (ID #${actualChannelId})`
    );

    const uniqueUsers = Array.from(usersByUserId.keys())
      .map((userId) => {
        const socketId = usersByUserId.get(userId);
        return connectedUsers.get(socketId);
      })
      .filter(Boolean);

    socket.emit("users_list", uniqueUsers);
    io.emit("users_list", uniqueUsers); // Emit to all connected sockets

    console.log(`${userData.username} joined the chat`);
  });

  // Handle channel switching
  socket.on("join_channel", async (channelData) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      const previousChannelId = user.currentChannel;
      const previousChannelName = user.currentChannelName;
      const newChannelId = channelData.channel;

      // Get the new channel name
      const newChannelName = await getChannelName(prisma, newChannelId);

      // Leave the previous channel room
      if (previousChannelId) {
        socket.leave(previousChannelId);
        console.log(
          `${user.username} left room: #${previousChannelName} (${previousChannelId})`
        );
      }

      // Join the new channel room
      socket.join(newChannelId);
      user.currentChannel = newChannelId;
      user.currentChannelName = newChannelName;

      console.log(
        `${user.username} joined room: #${newChannelName} (${newChannelId})`
      );

      // Send a confirmation back to the client
      socket.emit("channel_joined", {
        channel: newChannelId,
        channelName: newChannelName,
        previousChannel: previousChannelId,
        previousChannelName: previousChannelName,
      });
    }
  });

  // Handle new chat messages
  socket.on("send_message", async (messageData) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      const channelId = messageData.channel || user.currentChannel;
      const { text } = messageData;

      if (!channelId || !text || !user.userId) {
        console.error("Missing data for message:", {
          channelId,
          text,
          userId: user.userId,
        });
        return;
      }

      try {
        // Get channel name for display purposes
        const channelName = await getChannelName(prisma, channelId);

        // Persist the message to the database
        const newMessage = await prisma.message.create({
          data: {
            content: text,
            channelId: channelId,
            userId: user.userId,
          },
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        });

        // Format the persisted message to send to clients
        const formattedMessage = {
          id: newMessage.id,
          text: newMessage.content,
          username: newMessage.user.username,
          userId: newMessage.userId,
          timestamp: newMessage.createdAt.toISOString(),
          channel: channelId, // Include channel ID for client routing
          channelName: channelName, // Include channel name for display
          isSystem: false,
        };

        // Emit the message to all users in the channel room
        io.to(channelId).emit("receive_message", formattedMessage);

        // Send notification to users who are members of this channel but not currently viewing it
        try {
          // Get all members of this channel from the database
          const channelMembers = await prisma.channelMember.findMany({
            where: { channelId: channelId },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          });

          // Get all currently connected users
          const allConnectedUsers = Array.from(connectedUsers.values());

          // Filter for users who:
          // 1. Are members of this channel
          // 2. Are currently connected
          // 3. Are NOT currently viewing this channel
          // 4. Are NOT the message sender
          const usersToNotify = allConnectedUsers.filter((connectedUser) => {
            // Check if user is a member of this channel
            const isMember = channelMembers.some(
              (member) => member.user.id === connectedUser.userId
            );

            // Check if user is not currently viewing this channel
            const isNotInCurrentChannel =
              connectedUser.currentChannel !== channelId;

            // Check if user is not the sender
            const isNotSender = connectedUser.id !== socket.id;

            return isMember && isNotInCurrentChannel && isNotSender;
          });

          // Send notifications to eligible users
          usersToNotify.forEach((otherUser) => {
            io.to(otherUser.id).emit("message_notification", {
              title: `New message in #${channelName}`, // Use channel name for display
              message: `${
                formattedMessage.username
              }: ${formattedMessage.text.substring(0, 50)}${
                formattedMessage.text.length > 50 ? "..." : ""
              }`,
              channel: channelId, // Send channel ID for routing
              channelName: channelName, // Send channel name for display
              messageId: formattedMessage.id,
              username: formattedMessage.username,
            });
          });

          console.log(
            `Sent notifications to ${usersToNotify.length} users for message in #${channelName}`
          );
        } catch (notificationError) {
          console.error("Error sending notifications:", notificationError);
          // Don't fail the entire message sending if notifications fail
        }

        console.log(
          `Message from ${user.username} in #${channelName}: ${messageData.text}`
        );
      } catch (error) {
        console.error("Error saving message to database:", error);
        socket.emit("message_error", {
          message: "Failed to send message: database error.",
        });
      }
    } else {
      console.warn(
        "Attempted to send message from unconnected socket:",
        socket.id
      );
    }
  });

  // Handle typing indicators
  socket.on("typing_start", async (data) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      const channelId = data?.channel || user.currentChannel;
      const channelName = await getChannelName(prisma, channelId);

      // Send typing indicator only to users in the same channel
      socket.to(channelId).emit("user_typing", {
        username: user.username,
        channel: channelId,
        channelName: channelName,
        isTyping: true,
      });
    }
  });

  socket.on("typing_stop", async (data) => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      const channelId = data?.channel || user.currentChannel;
      const channelName = await getChannelName(prisma, channelId);

      // Send typing stop only to users in the same channel
      socket.to(channelId).emit("user_typing", {
        username: user.username,
        channel: channelId,
        channelName: channelName,
        isTyping: false,
      });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      if (user.currentChannel) {
        socket.leave(user.currentChannel);
      }

      connectedUsers.delete(socket.id);
      usersByUserId.delete(user.userId);

      const uniqueUsers = Array.from(usersByUserId.keys())
        .map((userId) => {
          const socketId = usersByUserId.get(userId);
          return connectedUsers.get(socketId);
        })
        .filter(Boolean);

      socket.broadcast.emit("users_list", uniqueUsers);

      console.log(
        `${user.username} disconnected from room: ${user.currentChannel}`
      );
    } else {
      console.log("User disconnected:", socket.id);
    }
  });
};
