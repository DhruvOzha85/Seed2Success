const express = require("express");
const router = express.Router();

const { getRegionOptions, recommendCrops } = require("../Services/cropEngine");
const { getWeatherForDistrict } = require("../Services/weatherService");

/**
 * POST /recommend-crop/farm-input
 * Receives farmer inputs and returns top 3 crop recommendations.
 */
router.post("/farm-input", async (req, res) => {
  try {
    const result = await recommendCrops(req.body);
    res.json(result);
  } catch (error) {
    console.error("Recommendation error:", error.message);
    res.status(400).json({
      error: error.message || "Unable to recommend crops",
    });
  }
});

/**
 * POST /recommend-crop/ (backward compatibility)
 * Same as farm-input endpoint.
 */
router.post("/", async (req, res) => {
  try {
    const result = await recommendCrops(req.body);
    res.json(result);
  } catch (error) {
    console.error("Recommendation error:", error.message);
    res.status(400).json({
      error: error.message || "Unable to recommend crops",
    });
  }
});

/**
 * GET /recommend-crop/weather?state=X&district=Y
 * Fetch weather data for a specific district using Open-Meteo API.
 */
router.get("/weather", async (req, res) => {
  try {
    const { state, district } = req.query;

    if (!state || !district) {
      return res.status(400).json({
        error: "Both 'state' and 'district' query parameters are required.",
      });
    }

    const weather = await getWeatherForDistrict(state, district);
    res.json(weather);
  } catch (error) {
    console.error("Weather fetch error:", error.message);
    res.status(400).json({
      error: error.message || "Unable to fetch weather data",
    });
  }
});

/**
 * GET /recommend-crop/recommend-crops?state=X&district=Y&landArea=Z&budget=B&labour=L&previousCrop=C
 * Runs crop scoring algorithm and returns top 3 crops via GET.
 */
router.get("/recommend-crops", async (req, res) => {
  try {
    const { state, district, landArea, budget, labour, previousCrop } =
      req.query;

    if (!state || !district) {
      return res.status(400).json({
        error: "Both 'state' and 'district' query parameters are required.",
      });
    }

    const input = {
      state,
      district,
      landArea: Number(landArea) || 1,
      budget: Number(budget) || 50000,
      labour: labour || "medium",
      previousCrop: previousCrop || "",
    };

    const result = await recommendCrops(input);
    res.json(result);
  } catch (error) {
    console.error("Recommendation error:", error.message);
    res.status(400).json({
      error: error.message || "Unable to recommend crops",
    });
  }
});

/**
 * GET /recommend-crop/regions
 * Returns the list of states and districts.
 */
router.get("/regions", async (_req, res) => {
  try {
    const regions = await getRegionOptions();
    res.json(regions);
  } catch (error) {
    console.error("Region fetch error:", error.message);
    res.status(500).json({
      error: error.message || "Unable to fetch regions",
    });
  }
});

module.exports = router;
