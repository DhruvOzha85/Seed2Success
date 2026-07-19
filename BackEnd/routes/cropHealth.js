const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();
const upload = multer();

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";
const FASTAPI_KEY = process.env.FASTAPI_KEY || "s2s_test_key_123";

router.post("/analyze", upload.any(), async (req, res) => {
  try {
    const imageFile = req.files && req.files.find(f => f.mimetype.startsWith('image/'));
    if (!imageFile) {
      return res.status(400).json({ success: false, error: "An image is required for Health Analysis." });
    }

    const form = new FormData();
    form.append("image", imageFile.buffer, {
      filename: imageFile.originalname,
      contentType: imageFile.mimetype,
    });
    form.append("task_type", "health");
    form.append("context", req.body.answers || "{}");

    const response = await axios.post(`${FASTAPI_URL}/api/v1/vision/analyze`, form, {
      headers: {
        ...form.getHeaders(),
        "X-API-Key": FASTAPI_KEY,
      },
    });

    res.json({
      success: true,
      ...response.data,
    });
  } catch (error) {
    console.error("Health Analysis Vision Error:", error?.response?.data || error.message);
    res.status(500).json({ success: false, error: "Failed to generate dynamic health analysis via AI." });
  }
});

module.exports = router;
