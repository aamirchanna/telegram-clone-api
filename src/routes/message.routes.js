//Make sure you have a GET /messages/:chatId route in your Node.js backend:
// src/routes/message.routes.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/auth.middleware");

// Get all messages for a chat
router.get("/:chatId", authMiddleware, async (req, res) => {
    const { chatId } = req.params;
    try {
        const { rows } = await pool.query(
            "SELECT * FROM messages WHERE chat_id=$1 ORDER BY created_at ASC",
            [chatId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch messages", details: err.message });
    }
});

module.exports = router;
