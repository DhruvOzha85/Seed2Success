const express = require("express");
const fs = require("fs");
const path = require("path");
const Scheme = require("../Modules/scheme");

const router = express.Router();

// GET /api/schemes — list all schemes with optional filters
router.get("/", async (req, res) => {
  try {
    const { state, category, crop, search } = req.query;
    const filter = {};

    // Category filter
    if (category && category !== "all") {
      filter.category = category.toLowerCase();
    }

    // State filter
    if (state && state !== "all") {
      filter.states = { $in: ["all", state] };
    }

    // Crop filter
    if (crop && crop !== "all") {
      filter.crops = { $in: ["all", crop.toLowerCase()] };
    }

    // Text search
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { ministry: { $regex: search.trim(), $options: "i" } },
        { eligibility: { $regex: search.trim(), $options: "i" } },
      ];
    }

    let schemes = [];
    try {
      schemes = await Scheme.find(filter).sort({ lastUpdated: -1 });
    } catch (dbError) {
      console.warn("Database error fetching schemes, falling back to JSON:", dbError.message);
    }

    // Fallback to JSON if DB returned nothing or failed
    if (schemes.length === 0) {
      const seedPath = path.join(__dirname, "..", "seed-data", "schemes.json");
      
      if (fs.existsSync(seedPath)) {
        const rawData = fs.readFileSync(seedPath, "utf8");
        let allSchemes = JSON.parse(rawData);
        
        // Add pseudo-IDs if they don't exist
        allSchemes = allSchemes.map((s, index) => ({
          ...s,
          _id: s._id || `json_scheme_${index}_${s.name.replace(/\s+/g, '_').toLowerCase()}`
        }));

        // Manual Filtering for fallback
        schemes = allSchemes.filter(s => {
          // Category
          if (category && category !== "all" && s.category !== category.toLowerCase()) return false;
          
          // State
          if (state && state !== "all" && !s.states.includes("all") && !s.states.includes(state)) return false;
          
          // Crop
          if (crop && crop !== "all" && !s.crops.includes("all") && !s.crops.includes(crop.toLowerCase())) return false;
          
          // Search
          if (search && search.trim()) {
            const term = search.trim().toLowerCase();
            return (
              s.name.toLowerCase().includes(term) ||
              s.description.toLowerCase().includes(term) ||
              s.ministry.toLowerCase().includes(term) ||
              s.eligibility.toLowerCase().includes(term)
            );
          }
          
          return true;
        });
        
        // Sort by date (desc)
        schemes.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
      }
    }

    res.json({ success: true, count: schemes.length, schemes });
  } catch (error) {
    console.error("Error fetching schemes:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch schemes." });
  }
});

// GET /schemes/:id — single scheme detail
router.get("/:id", async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ success: false, error: "Scheme not found." });
    }
    res.json({ success: true, scheme });
  } catch (error) {
    console.error("Error fetching scheme:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch scheme." });
  }
});

module.exports = router;
