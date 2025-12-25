const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");

const pool = require("./src/db");
const authRoutes = require("./src/routes/auth.routes");
const chatRoutes = require("./src/routes/chat.routes");
const messageRoutes = require("./src/routes/message.routes");
const authMiddleware = require("./src/middleware/auth.middleware");

const app = express();

// Security & Middleware
app.use(helmet());
app.use(cors());
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
  cors: { origin: process.env.CORS_ORIGIN || "*" },
});

// Socket.io connection
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
      console.log(`Socket ${socket.id} joined chat ${chatId}`);
      socket.emit("joined_chat", { chatId });
    } catch (err) {
      console.error("join_chat error:", err);
      socket.emit("error", { message: "Failed to join chat" });
    }
  });

  // Send message
  socket.on("send_message", async (data) => {
    const { chat_id, sender_id, content } = data;

    if (!chat_id || !sender_id || !content) {
      socket.emit("error", { error: "Missing required fields: chat_id, sender_id, content" });
      return;
    }

    try {
      const { rows } = await pool.query(
        "INSERT INTO messages(id, chat_id, sender_id, text) VALUES(gen_random_uuid(), $1, $2, $3) RETURNING *",
        [chat_id, sender_id, content]
      );

      const message = rows[0];

      // Emit message to all clients in chat
      io.to(chat_id).emit("receive_message", message);
    } catch (err) {
      console.error("Send message error:", err);
      socket.emit("error", { error: "Message sending failed", details: err.message });
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`Client disconnected: ${socket.id}, Reason: ${reason}`);
  });

  socket.on("error", (err) => {
    console.error(`Socket error on ${socket.id}:`, err);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✓ API + Socket.io running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});
