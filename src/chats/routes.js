const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth.middleware');

// Get all chats for logged-in user
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware

    // Get chats where user is a member
    const { rows } = await pool.query(
      `SELECT c.id, c.title, c.is_group, c.created_by, c.created_at
       FROM chats c
       JOIN chat_members cm ON cm.chat_id = c.id
       WHERE cm.user_id = $1`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch chats', details: err.message });
  }
});

// Create a new chat
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { title, is_group } = req.body;
    const userId = req.user.id;

    const { rows } = await pool.query(
      `INSERT INTO chats (title, is_group, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, title, is_group, created_by, created_at`,
      [title || null, is_group || false, userId]
    );

    const chat = rows[0];

    // Add creator to chat_members
    await pool.query(
      `INSERT INTO chat_members (chat_id, user_id)
       VALUES ($1, $2)`,
      [chat.id, userId]
    );

    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chat creation failed', details: err.message });
  }
});

module.exports = router;
