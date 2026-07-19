const express = require("express");
const router = express.Router();
const History = require("../Modules/history");

/**
 * GET /api/history
 * Fetch history for the authenticated user.
 */
router.get("/", async (req, res) => {
  try {
    const history = await History.find({ userId: req.user.userId }).sort({ timestamp: -1 });
    res.json(history);
  } catch (error) {
    console.error("History fetch error:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

/**
 * POST /api/history
 * Save a new history record.
 */
router.post("/", async (req, res) => {
  try {
    const { type, input, result } = req.body;
    
    if (!type || !input || !result) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newHistory = new History({
      userId: req.user.userId,
      type,
      input,
      result
    });

    await newHistory.save();
    res.status(201).json(newHistory);
  } catch (error) {
    console.error("History save error:", error);
    res.status(500).json({ error: "Failed to save history" });
  }
});

module.exports = router;
