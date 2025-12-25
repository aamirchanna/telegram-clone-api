const { v4: uuidv4 } = require("uuid");
const pool = require("../db");

exports.sendMessage = async (req, res) => {
  try {
    const { chat_id, content } = req.body; // keep content in request
    const sender_id = req.user.id;
    const id = uuidv4();

    const { rows } = await pool.query(
      "INSERT INTO messages(id, chat_id, sender_id, text) VALUES($1,$2,$3,$4) RETURNING *",
      [id, chat_id, sender_id, content] // content maps to text column
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Message sending failed", details: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const { rows } = await pool.query(
      "SELECT m.id, m.chat_id, m.sender_id, u.username AS sender_name, m.text AS content, m.created_at " +
      "FROM messages m " +
      "JOIN users u ON m.sender_id = u.id " +
      "WHERE m.chat_id = $1 ORDER BY m.created_at ASC",
      [chatId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fetching messages failed", details: err.message });
  }
};
