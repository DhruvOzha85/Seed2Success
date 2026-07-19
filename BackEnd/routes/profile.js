const express = require("express");
const User = require("../Modules/user");

const router = express.Router();

// GET /api/profile
// Get current user profile
router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Profile GET error:", error.message);
    res.status(500).json({ error: "Server error while fetching profile" });
  }
});

// PUT /api/profile
// Update current user profile
router.put("/", async (req, res) => {
  try {
    const { name, email, profilePicture, state, district, locationName, latitude, longitude } = req.body;
    
    // Find user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if new email is already taken by someone else
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingEmail) {
        return res.status(400).json({ error: "Email is already in use by another account." });
      }
      user.email = email.toLowerCase().trim();
    }

    if (name) {
      user.name = name.trim();
    }

    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (state !== undefined) user.state = state;
    if (district !== undefined) user.district = district;
    if (locationName !== undefined) user.locationName = locationName;
    if (latitude !== undefined) user.latitude = latitude;
    if (longitude !== undefined) user.longitude = longitude;

    if (state !== undefined || district !== undefined || locationName !== undefined || latitude !== undefined || longitude !== undefined) {
      user.locationUpdatedAt = new Date();
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        state: user.state,
        district: user.district,
        locationName: user.locationName,
        latitude: user.latitude,
        longitude: user.longitude,
        locationUpdatedAt: user.locationUpdatedAt
      }
    });

  } catch (error) {
    console.error("Profile PUT error:", error.message);
    res.status(500).json({ error: "Server error while updating profile" });
  }
});

module.exports = router;
