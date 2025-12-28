const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");

const pool = require("./src/db");
const authRoutes = require("./src/routes/auth.routes");
const chatRoutes = require("./src/chats/routes");
const messageRoutes = require("./src/routes/message.routes");
const userRoutes = require("./src/routes/user.routes");
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
app.use("/users", authMiddleware, userRoutes);

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Create HTTP server and attach Socket.io using centralized socket module
const server = http.createServer(app);
const initSocket = require("./src/sockets/socket");
const io = initSocket(server);

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
