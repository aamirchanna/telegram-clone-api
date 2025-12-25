const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controllers"); // correct path

router.post("/register", authController.register); // function reference
router.post("/login", authController.login);       // function reference

module.exports = router;
