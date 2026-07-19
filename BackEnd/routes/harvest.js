const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();
const upload = multer();

const seedCrops = require("../seed-data/crops.json");

router.post("/analyze", upload.any(), async (req, res) => {
  try {
    const answers = JSON.parse(req.body.answers || "{}");
    const lat = req.body.latitude || 28.7041;
    const lon = req.body.longitude || 77.1025;
    
    const cropInput = (answers.cropType || "").trim();
    if (!cropInput) {
      return res.status(400).json({ error: "Crop type is required." });
    }

    const isValidCrop = seedCrops.some(c => c.crop_name.toLowerCase() === cropInput.toLowerCase());
    if (!isValidCrop) {
      return res.status(400).json({ error: "Invalid crop type. Please enter a recognized crop name (e.g. Paddy, Wheat, Cotton, Tomato)." });
    }

    // Fetch Weather Data
    let weatherData = null;
    try {
      const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,precipitation_sum&timezone=auto`);
      weatherData = weatherRes.data;
    } catch (e) {
      console.error("Failed to fetch weather", e.message);
    }

    const crop = cropInput;
    const maturity = answers.maturityStage || "Not yet ready";
    const landSize = parseFloat(answers.landSize) || 5;
    const workers = parseInt(answers.workersAvailable) || 0;
    const equipment = answers.equipmentAvailable === "yes";
    
    // Readiness calculations
    let readinessScore = 50;
    let verdict = "Monitor field";
    if (maturity === "Ready now") {
      readinessScore = 95;
      verdict = "Ready for harvest";
    } else if (maturity === "Nearly ready") {
      readinessScore = 75;
      verdict = "Prepare for harvest";
    } else if (maturity === "Overdue") {
      readinessScore = 60;
      verdict = "Urgent harvest needed";
    }

    // Weather Risks
    let riskLevel = "Low";
    const weatherRisks = [];
    if (answers.weatherConcerns && answers.weatherConcerns.length > 0 && !answers.weatherConcerns.includes("No weather concerns")) {
      riskLevel = "Medium";
      answers.weatherConcerns.forEach(concern => {
        weatherRisks.push({ concern, severity: "High", note: "Reported by user as a concern." });
      });
    }
    
    if (weatherData && weatherData.daily && weatherData.daily.precipitation_sum) {
      const rainExpected = weatherData.daily.precipitation_sum.some(p => p > 5);
      if (rainExpected) {
        riskLevel = "High";
        weatherRisks.push({ concern: "Expected Rain", severity: "High", note: "Forecast shows >5mm precipitation in coming days." });
      }
    }
    
    if (weatherRisks.length === 0) {
      weatherRisks.push({ concern: "Clear skies", severity: "Low", note: "No major weather disruptions forecasted." });
    }

    // Labour Estimates
    const baseDaysPerAcrePerWorker = 2; // rough assumption
    let estimatedDays = 0;
    let bottleneck = "None";
    if (workers > 0) {
      estimatedDays = Math.ceil((landSize * baseDaysPerAcrePerWorker) / workers);
      if (equipment) estimatedDays = Math.ceil(estimatedDays * 0.5); // Equipment halves time
      if (estimatedDays > 7) bottleneck = "Labour shortage";
    } else {
      bottleneck = "No workers available";
    }

    // Cost Estimates
    const labourCost = workers > 0 ? (workers * 400 * estimatedDays) : (landSize * 2000); 
    const opCost = equipment ? (landSize * 1500) : 0;
    const transCost = answers.transportArranged === "yes" ? 0 : (landSize * 800);
    const storeCost = answers.storageAvailable === "yes" ? 0 : (landSize * 500);
    const totalCost = labourCost + opCost + transCost + storeCost;

    let responseData = {
      summary: {
        cropName: crop,
        maturityStage: maturity,
        readinessScore: readinessScore
      },
      cards: {
        harvestReadiness: {
          verdict,
          score: readinessScore,
          confidence: "High",
          reasons: [
            `Crop maturity reported as: ${maturity}`,
            workers > 0 ? "Labour is secured" : "Labour needs to be arranged",
            answers.storageAvailable === "yes" ? "Storage is ready" : "Storage pending"
          ]
        },
        bestHarvestWindow: {
          recommendation: riskLevel === "High" ? "Accelerate harvest before rain" : "Proceed with scheduled harvest",
          idealTimeOfDay: "Early morning or late afternoon",
          urgency: maturity === "Overdue" ? "Critical" : (maturity === "Ready now" ? "High" : "Normal")
        },
        weatherRiskOutlook: {
          overallRisk: riskLevel,
          risks: weatherRisks,
          advisory: riskLevel === "High" ? "Ensure tarps and quick transport are available due to weather risks." : "Weather looks favorable for harvesting."
        },
        labourAndTimeEstimate: {
          landSize: `${landSize} acres`,
          cropType: crop,
          workersAvailable: `${workers} workers`,
          labourDaysNeeded: estimatedDays * workers,
          estimatedHarvestDays: estimatedDays,
          bottleneck
        },
        harvestCostEstimate: {
          labourCost: labourCost,
          operationsCost: opCost,
          transportCost: transCost,
          storagePreparationCost: storeCost,
          totalCost: totalCost,
          note: equipment ? "Equipment usage is factored into operations cost." : "Manual harvesting estimated."
        },
        postHarvestCare: {
          recommendations: [
            "Ensure moisture levels are checked before storage",
            answers.storageAvailable === "yes" ? "Move to designated storage immediately" : "Arrange temporary covered storage",
            answers.transportArranged === "yes" ? "Coordinate with transport early morning" : "Find transport vendors ASAP"
          ]
        },
        harvestActionPlan: {
          steps: [
            { day: "Day 1", title: "Preparation", task: "Gather equipment and brief workers." },
            { day: "Day 2", title: "Execution", task: "Begin cutting from the highest-yield sections." },
            { day: "Day 3", title: "Post-Processing", task: "Dry, sort, and prepare for transport or storage." }
          ]
        }
      }
    };

    res.json({
      success: true,
      ...responseData,
    });
  } catch (error) {
    console.error("Harvest Analysis Error:", error?.response?.data || error.message);
    res.status(500).json({ success: false, error: "Failed to generate dynamic harvest analysis." });
  }
});

module.exports = router;
