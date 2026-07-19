const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const User = require("../Modules/user");

const router = express.Router();

// Security: Auth Rate Limiting (Prevents brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth routes
  message: { error: "Too many login attempts from this IP, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const JWT_SECRET = process.env.JWT_SECRET || "seed2success_jwt_fallback_secret";
const JWT_EXPIRES_IN = "7d";

async function hashPassword(password) {
  // Use 12 rounds for enterprise-grade security
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

async function comparePassword(password, storedPassword) {
  // Backward compatibility for users who registered before the bcrypt migration
  if (String(storedPassword).startsWith("pbkdf2$")) {
    const [scheme, salt, storedHash] = String(storedPassword).split("$");
    const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
    return crypto.timingSafeEqual(Buffer.from(computedHash, "hex"), Buffer.from(storedHash, "hex"));
  }
  
  // Use strictly bcrypt for comparison
  return bcrypt.compare(password, storedPassword);
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * POST /auth/register
 * Create a new user account.
 */
router.post("/register", authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    // Generate JWT
    const token = signToken({ userId: user._id.toString() });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        state: user.state,
        district: user.district,
        locationName: user.locationName,
        latitude: user.latitude,
        longitude: user.longitude
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ error: "Server error during registration." });
  }
});

/**
 * POST /auth/login
 * Authenticate an existing user.
 */
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Compare password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Generate JWT
    const token = signToken({ userId: user._id.toString() });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        state: user.state,
        district: user.district,
        locationName: user.locationName,
        latitude: user.latitude,
        longitude: user.longitude
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: "Server error during login." });
  }
});

module.exports = router;
