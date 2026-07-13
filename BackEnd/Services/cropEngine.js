const Crop = require("../Modules/crops");
const Region = require("../Modules/region");
const mongoose = require("mongoose");
const { getWeatherForDistrict } = require("./weatherService");
const { calculateCropScore } = require("../utils/scoring");
const seedRegions = require("../seed-data/regions.json");
const seedCrops = require("../seed-data/crops.json");

async function loadRegions() {
  if (mongoose.connection.readyState !== 1) {
    return seedRegions;
  }

  try {
    const regionRows = await Region.find({}, { _id: 0, state: 1, district: 1 })
      .sort({ state: 1, district: 1 })
      .lean();

    if (regionRows.length > 0) {
      return regionRows.reduce((acc, row) => {
        if (!acc[row.state]) {
          acc[row.state] = [];
        }

        acc[row.state].push(row.district);
        return acc;
      }, {});
    }
  } catch (error) {
    console.warn(`Region lookup fallback: ${error.message}`);
  }

  return seedRegions;
}

async function loadCrops() {
  if (mongoose.connection.readyState !== 1) {
    return seedCrops;
  }

  try {
    const crops = await Crop.find({}).lean();

    if (crops.length > 0) {
      return crops;
    }
  } catch (error) {
    console.warn(`Crop lookup fallback: ${error.message}`);
  }

  return seedCrops;
}

async function getRegionOptions() {
  return loadRegions();
}

/**
 * Main recommendation engine.
 * 1. Receive farmer inputs
 * 2. Fetch weather data from Open-Meteo
 * 3. Load crop dataset
 * 4. Score each crop using the scoring rules
 * 5. Sort crops by score
 * 6. Return the top 3 crops
 */
async function recommendCrops(input) {
  if (!input.state || !input.district) {
    throw new Error("State and district are required.");
  }

  // Step 1: Fetch real weather data
  let weather;
  try {
    weather = await getWeatherForDistrict(input.state, input.district);
  } catch (err) {
    console.error("Weather API error:", err.message);
    // Fallback to neutral weather if API fails
    weather = {
      temperature: 28,
      precipitation: 2,
      humidity: 60,
      windSpeed: null,
      weatherCode: null,
      location: { state: input.state, district: input.district },
    };
  }

  // Step 2: Score every crop in the dataset
  const crops = await loadCrops();

  if (crops.length === 0) {
    throw new Error("No crops found in MongoDB or seed data.");
  }

  const scoredCrops = crops.map((crop) =>
    calculateCropScore(input, crop, weather)
  );

  // Step 3: Sort by suitability score (descending)
  scoredCrops.sort((a, b) => b.suitability_score - a.suitability_score);

  // Step 4: Return the top 3
  const topCrops = scoredCrops.slice(0, 3);

  return {
    farmer_profile: {
      state: input.state,
      district: input.district,
      land_area: input.landArea,
      budget: input.budget,
      labour: input.labour,
      previous_crop: input.previousCrop || null,
    },
    weather_data: {
      temperature: weather.temperature,
      precipitation: weather.precipitation,
      humidity: weather.humidity,
      location: weather.location,
    },
    top_crops: topCrops,
    all_scores: scoredCrops.map((c) => ({
      crop: c.crop,
      score: c.suitability_score,
    })),
  };
}

module.exports = {
  getRegionOptions,
  recommendCrops,
};
