const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controllers");
const authMiddleware = require("../middleware/auth.middleware");

// JWT-protected routes
router.post("/send", authMiddleware, messageController.sendMessage);
router.get("/:chatId", authMiddleware, messageController.getMessages);

module.exports = router;
