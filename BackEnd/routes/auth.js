const express = require("express");
const crypto = require("crypto");
const User = require("../Modules/user");

let bcrypt = null;
let jwt = null;

try {
  bcrypt = require("bcryptjs");
} catch (_error) {
  bcrypt = null;
}

try {
  jwt = require("jsonwebtoken");
} catch (_error) {
  jwt = null;
}

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "seed2success_jwt_fallback_secret";
const JWT_EXPIRES_IN = "7d";

function base64Url(input) {
  return Buffer.from(input).toString("base64url");
}

function fallbackHash(password, salt) {
  return crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
}

async function hashPassword(password) {
  if (bcrypt) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = fallbackHash(password, salt);
  return `pbkdf2$${salt}$${hash}`;
}

async function comparePassword(password, storedPassword) {
  if (bcrypt && !String(storedPassword).startsWith("pbkdf2$")) {
    return bcrypt.compare(password, storedPassword);
  }

  const [scheme, salt, storedHash] = String(storedPassword).split("$");

  if (scheme !== "pbkdf2" || !salt || !storedHash) {
    return false;
  }

  const computedHash = fallbackHash(password, salt);
  return crypto.timingSafeEqual(
    Buffer.from(computedHash, "hex"),
    Buffer.from(storedHash, "hex")
  );
}

function signToken(payload) {
  if (jwt) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  const body = base64Url(JSON.stringify({ ...payload, exp }));
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
}

/**
 * POST /auth/register
 * Create a new user account.
 */
router.post("/register", async (req, res) => {
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
router.post("/login", async (req, res) => {
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
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: "Server error during login." });
  }
});

module.exports = router;
