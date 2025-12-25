const { Server } = require("socket.io");
const pool = require("../db");

function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" }, // allow all origins for testing
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Join chat room
    socket.on("join_chat", (chatId) => {
      try {
        if (!chatId) {
          socket.emit("error", { message: "chatId is required" });
          return;
        }
        socket.join(chatId);
        socket.emit("joined_chat", { chatId });
      } catch (err) {
        console.error("join_chat error:", err);
        socket.emit("error", { message: "Failed to join chat" });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("Client disconnected:", socket.id, reason);
    });

    socket.on("error", (err) => {
      console.error("Socket error on", socket.id, err);
    });
  });

  return io;
}

module.exports = initSocket;