// src/controllers/chat.controller.js
const pool = require("../db");
const { v4: uuidv4 } = require("uuid");

exports.createChat = async (req, res) => {
  try {
    const { title, is_group = false } = req.body; // use title instead of name
    const created_by = req.user.id; // from JWT
    const id = uuidv4();

    const { rows } = await pool.query(
      "INSERT INTO chats(id, title, is_group, created_by) VALUES($1,$2,$3,$4) RETURNING *",
      [id, title, is_group, created_by]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error("CREATE CHAT ERROR:", err.message);
    res.status(500).json({ error: "Chat creation failed", details: err.message });
  }
};

exports.getChats = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM chats ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("GET CHATS ERROR:", err.message);
    res.status(500).json({ error: "Fetching chats failed", details: err.message });
  }
};
