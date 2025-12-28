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

    // Send message (robust: accept JSON string or object, save to DB, broadcast saved message)
    socket.on("send_message", async (messageData) => {
      try {
        const message = typeof messageData === 'string' ? JSON.parse(messageData) : messageData || {};

        const chatId = message.chatId || message.chat_id;
        const senderId = message.senderId || message.sender_id;
        const content = message.content || message.text;

        if (!chatId || !senderId || !content) {
          socket.emit('error', { message: 'Missing required fields: chatId, senderId, content' });
          return;
        }

        // Optional: ensure sender is a member of the chat
        try {
          const memberCheck = await pool.query(
            'SELECT 1 FROM chat_members WHERE chat_id = $1 AND user_id = $2 LIMIT 1',
            [chatId, senderId]
          );
          if (memberCheck.rowCount === 0) {
            socket.emit('error', { message: 'Sender is not a member of the chat' });
            return;
          }
        } catch (chkErr) {
          console.error('Member check failed:', chkErr);
          // continue — membership enforcement is optional depending on your use-case
        }

        const { rows } = await pool.query(
          "INSERT INTO messages(id, chat_id, sender_id, text) VALUES(gen_random_uuid(), $1, $2, $3) RETURNING id, chat_id, sender_id, text AS content, created_at",
          [chatId, senderId, content]
        );

        const savedMessage = rows[0];

        // Broadcast the saved message (with permanent id + timestamp) to the room
        io.to(chatId).emit('receive_message', savedMessage);

        console.log(`Message saved and broadcasted to room: ${chatId}`);
      } catch (err) {
        console.error('Error handling send_message event:', err);
        socket.emit('error', { message: 'Failed to handle send_message', details: err.message });
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