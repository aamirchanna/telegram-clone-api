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
      socket.join(chatId
