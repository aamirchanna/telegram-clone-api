// src/routes/chat.routes.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const authMiddleware = require("../middleware/auth.middleware"); // protects routes

// Protect routes with JWT middleware
router.post("/create", authMiddleware, chatController.createChat);
router.get("/", authMiddleware, chatController.getChats);

module.exports = router;
