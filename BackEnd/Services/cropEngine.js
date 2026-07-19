const axios = require("axios");
const Crop = require("../Modules/crops");
const { calculateCropScore } = require("../utils/scoring");
const Region = require("../Modules/region");
const mongoose = require("mongoose");
const seedRegions = require("../seed-data/regions.json");
const seedCrops = require("../seed-data/crops.json");

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";
const FASTAPI_KEY = process.env.FASTAPI_KEY || "s2s_test_key_123";

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

function normalizeCropName(mlCropName) {
  if (!mlCropName) return "";
  let name = mlCropName.toUpperCase().replace(/\(.*\)/g, '').trim();
  if (name === "TUR" || name === "ARHAR") return "PIGEON PEA";
  if (name === "GRAM") return "CHICKPEA";
  if (name === "SOYABEAN") return "SOYBEAN";
  return name;
}

/**
 * Main recommendation engine using the ML microservice.
 * 1. Receive farmer inputs (with latitude & longitude)
 * 2. Fetch context (weather, soil) from FastAPI
 * 3. Fetch predictions from FastAPI best_model.pkl
 * 4. Augment with local crop_info
 */
async function recommendCrops(input) {
  let lat = input.latitude || 28.7041;
  let lon = input.longitude || 77.1025;

  let contextData;

  try {
    const contextRes = await axios.post(`${FASTAPI_URL}/api/v1/context`, { latitude: lat, longitude: lon, state: input.state, district: input.district }, { headers: { 'X-API-Key': FASTAPI_KEY } });
    contextData = contextRes.data;
  } catch (error) {
    console.error("FastAPI Context error:", error.response?.data || error.message);
    throw new Error("Failed to fetch context data. Ensure the AI service is running.");
  }

  const cropsData = await loadCrops();

  const formattedCrops = cropsData.map((dbCrop) => {
    // Calculate the real score based on local deterministic agronomic data
    const weatherObj = {
      temperature: contextData.weather.avg_temp || contextData.weather.temperature || 28,
      precipitation: contextData.weather.total_rainfall || contextData.weather.precipitation || 10,
      humidity: contextData.weather.avg_humidity || contextData.weather.humidity || 65,
    };
    
    const cropScore = calculateCropScore(input, dbCrop, weatherObj);
    const landArea = Number(input.landArea) || 1;
    
    return {
      crop: dbCrop.crop_name,
      suitability_score: cropScore.suitability_score,
      risk_level: cropScore.risk_level,
      estimated_cost: cropScore.estimated_cost,
      expected_yield: `${(dbCrop.avg_yield_per_acre * landArea).toFixed(2)} tons`, // static yield logic since ML yield is removed
      ml_score: cropScore.suitability_score, // fallback
      crop_info: {
        season: dbCrop.season,
        growing_days: dbCrop.growing_days,
        ideal_temp: `${dbCrop.ideal_temp_min}°C - ${dbCrop.ideal_temp_max}°C`,
        rainfall_range: `${dbCrop.rainfall_min}mm - ${dbCrop.rainfall_max}mm`,
        water_requirement: dbCrop.water_requirement,
        labour_need: dbCrop.labour_need,
        cost_per_acre: dbCrop.avg_cost_per_acre,
        yield_per_acre: dbCrop.avg_yield_per_acre,
        market_price: dbCrop.avg_market_price,
      },
      dynamic_soil: {
        ph: contextData.soil?.ph ? contextData.soil.ph.toFixed(3) : "N/A",
        nitrogen: contextData.soil?.nitrogen ? contextData.soil.nitrogen.toFixed(3) : "N/A",
        soc: contextData.soil?.soc ? contextData.soil.soc.toFixed(3) : "N/A",
        clay: contextData.soil?.clay ? contextData.soil.clay.toFixed(3) : "N/A",
        sand: contextData.soil?.sand ? contextData.soil.sand.toFixed(3) : "N/A",
        silt: contextData.soil?.silt ? contextData.soil.silt.toFixed(3) : "N/A",
        cec: contextData.soil?.cec ? contextData.soil.cec.toFixed(3) : "N/A",
        bulk_density: contextData.soil?.bulk_density ? contextData.soil.bulk_density.toFixed(3) : "N/A"
      },
      details: cropScore.details
    };
  });

  // Sort them by the suitability score, descending
  formattedCrops.sort((a, b) => b.suitability_score - a.suitability_score);

  // Take the top 3 crops for the UI
  const top3Crops = formattedCrops.slice(0, 3);

  // Update risk levels based on their final ranking
  top3Crops.forEach((c, index) => {
    c.risk_level = index === 0 ? "Low" : index === 1 ? "Medium" : "High";
  });

  return {
    farmer_profile: {
      state: input.state || contextData.state,
      district: input.district || contextData.district,
      land_area: input.landArea,
      budget: input.budget,
      labour: input.labour,
      previous_crop: input.previousCrop || null,
      latitude: lat,
      longitude: lon
    },
    weather_data: {
      temperature: contextData.weather.avg_temp || contextData.weather.temperature || 28,
      precipitation: contextData.weather.total_rainfall || contextData.weather.precipitation || 10,
      humidity: contextData.weather.avg_humidity || contextData.weather.humidity || 65,
      location: { state: input.state || contextData.state, district: input.district || contextData.district },
    },
    context: contextData, // Pass full context for other potential UI use
    top_crops: top3Crops,
    all_scores: top3Crops.map(c => ({ crop: c.crop, score: c.suitability_score }))
  };
}

module.exports = {
  getRegionOptions,
  recommendCrops,
};
