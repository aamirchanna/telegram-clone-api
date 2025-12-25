const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const pool = require("./src/db");
const authRoutes = require("./src/routes/auth.routes");
const chatRoutes = require("./src/routes/chat.routes");
const messageRoutes = require("./src/routes/message.routes");
const authMiddleware = require("./src/middleware/auth.middleware");

const app = express();
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/chat", authMiddleware, chatRoutes);
app.use("/messages", authMiddleware, messageRoutes);

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // allow all origins for testing
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Join chat room
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat ${chatId}`);
  });

  // Send message
  socket.on("send_message", async (data) => {
    const { chat_id, sender_id, content } = data;

    try {
      const { rows } = await pool.query(
        "INSERT INTO messages(id, chat_id, sender_id, text) VALUES(gen_random_uuid(), $1, $2, $3) RETURNING *",
        [chat_id, sender_id, content]
      );

      const message = rows[0];

      // Emit message to all clients in chat
      io.to(chat_id).emit("receive_message", message);
    } catch (err) {
      console.error(err);
      socket.emit("error", { error: "Message sending failed", details: err.message });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`API + Socket.io running on port ${PORT}`));
