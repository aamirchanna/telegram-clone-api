const pool = require('../db');

exports.listUsers = async (req, res) => {
  try {
    const currentUserId = req.user && req.user.id;
    const { rows } = await pool.query(
      'SELECT id, username, email FROM users WHERE id <> $1 ORDER BY username',
      [currentUserId || null]
    );
    res.json(rows);
  } catch (err) {
    console.error('LIST USERS ERROR:', err.message);
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
};
