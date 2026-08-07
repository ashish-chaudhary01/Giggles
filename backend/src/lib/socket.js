import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

const io = new Server(server, { cors: { origin: allowedOrigin } });

// returns user socketId
function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// online users map {userId:SocketId}
const userSocketMap = {};

io.on("connection", (socket) => {
  const userID = socket.handshake.query.userID;

  if (userID) userSocketMap[userID] = socket.id;

  // io.emit() sends event to everyone
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // socket.on() listen for events
  socket.on("disconnect", () => {
    if (userID) delete userSocketMap(userID);
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io, getReceiverSocketId };
