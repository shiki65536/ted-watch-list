const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");
const youtubeService = require("../services/youtubeService");

// Register
router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("username").trim().notEmpty(),
    body("youtubeApiKey")
      .trim()
      .notEmpty()
      .withMessage("YouTube API Key is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password, username, youtubeApiKey } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }

      // Validate the API Key with YouTube before creating user
      const keyCheck = await youtubeService.testApiKey(youtubeApiKey);
      if (!keyCheck.valid) {
        return res.status(400).json({
          success: false,
          message: `Invalid YouTube API Key: ${
            keyCheck.error || "Please check your key."
          }`,
        });
      }

      // Create new user
      const user = new User({
        email,
        password,
        username,
        youtubeApiKey,
      });

      await user.save();

      // Generate JWT
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "7d",
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          hasApiKey: !!user.youtubeApiKey,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Login
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Generate JWT
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "7d",
      });

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          hasApiKey: !!user.youtubeApiKey,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Get current user info
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        username: user.username,
        hasApiKey: !!user.youtubeApiKey,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update API Key
router.put(
  "/api-key",
  auth,
  [body("youtubeApiKey").trim().notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { youtubeApiKey } = req.body;

      const keyCheck = await youtubeService.testApiKey(youtubeApiKey);
      if (!keyCheck.valid) {
        return res.status(400).json({
          success: false,
          message: "Invalid YouTube API Key",
        });
      }

      const user = await User.findById(req.userId);
      user.youtubeApiKey = youtubeApiKey;
      await user.save();

      res.json({
        success: true,
        message: "API key updated successfully",
        hasApiKey: true,
      });
    } catch (error) {
      console.error("Update API key error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
