const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully", user: rows[0] });
  } catch (err) {
    console.error("REGISTER ERROR:", err.message);
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid password" });

    // 🔹 Log JWT secret
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET
    );

    res.json({ user: { id: user.id, username: user.username, email: user.email }, token });
  } catch (err) {
    console.error("LOGIN ERROR:", err.message); // 🔹 log exact error
    res.status(500).json({ error: "Login failed", details: err.message });
  }
};
