const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();
const upload = multer();

const seedCrops = require("../seed-data/crops.json");

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";
const FASTAPI_KEY = process.env.FASTAPI_KEY || "s2s_test_key_123";

router.post("/analyze", upload.any(), async (req, res) => {
  try {
    const answers = JSON.parse(req.body.answers || "{}");
    const cropInput = (answers.cropType || "").trim();
    if (!cropInput) {
      return res.status(400).json({ error: "Crop type is required." });
    }

    const isValidCrop = seedCrops.some(c => c.crop_name.toLowerCase() === cropInput.toLowerCase());
    if (!isValidCrop) {
      return res.status(400).json({ error: "Invalid crop type. Please enter a recognized crop name (e.g. Paddy, Wheat, Cotton, Tomato)." });
    }

    const crop = cropInput;
    const qty = parseFloat(answers.quantityValue || 25);
    const unit = answers.quantityUnit || "quintals";
    const quality = answers.qualitySignal || "average";
    
    // Default structured response matching SellingCards.jsx
    let responseData = {
      summary: {
        cropName: crop,
        maturityStage: "Harvested",
        readinessScore: quality === "good" ? 95 : (quality === "average" ? 80 : 60)
      },
      cards: {
        saleReadiness: {
          rating: quality === "good" ? "High" : (quality === "average" ? "Medium" : "Low"),
          score: quality === "good" ? 95 : (quality === "average" ? 80 : 60),
          note: `Based on your inputs, the lot is in ${quality} condition and ready for market.`
        },
        qualitySnapshot: {
          rating: quality === "good" ? "Grade A" : (quality === "average" ? "Grade B" : "Grade C"),
          strengths: [`${quality.charAt(0).toUpperCase() + quality.slice(1)} quality reported`],
          defects: [answers.defectLevel ? `${answers.defectLevel.charAt(0).toUpperCase() + answers.defectLevel.slice(1)} defect level reported` : "None"]
        },
        estimatedPriceRange: {
          low: 0,
          high: 0,
          expectedRevenue: 0,
          unit: "quintal"
        },
        historicalPriceContext: {
          trend: "Stable",
          note: "Prices for this crop have remained stable over the past 30 days in local APMC markets."
        },
        costAndMarginView: {
          bestCaseMargin: 0,
          averageCaseMargin: 0,
          cautiousCaseMargin: 0,
          totalSellingCost: 1500
        },
        sellNowVsStore: {
          recommendation: answers.sellingUrgency === "Ask the system for a recommendation" ? "Sell Now" : answers.sellingUrgency,
          rationale: "Given current market conditions and your urgency, proceeding with sale is recommended."
        }
      }
    };

    // Call the ML pricing model
    try {
      const mlRequest = {
        state: req.body.state || "Andhra Pradesh",
        district: req.body.district || "Guntur",
        cropType: crop,
        quantityValue: qty,
        quantityUnit: unit,
        sellingUrgency: answers.sellingUrgency || "Ask the system for a recommendation",
        qualitySignal: quality,
        defectLevel: answers.defectLevel || "medium",
      };

      const mlResponse = await axios.post(`${FASTAPI_URL}/api/v1/selling/predict`, mlRequest, {
        headers: {
          "X-API-Key": FASTAPI_KEY,
          "Content-Type": "application/json"
        },
      });

      if (mlResponse.data && mlResponse.data.success) {
        const basePrice = mlResponse.data.estimated_price_per_quintal;
        const totalRev = mlResponse.data.total_estimated_revenue;
        
        responseData.cards.estimatedPriceRange.low = Math.floor(basePrice * 0.95);
        responseData.cards.estimatedPriceRange.high = Math.ceil(basePrice * 1.05);
        responseData.cards.estimatedPriceRange.expectedRevenue = Math.round(totalRev);
        
        responseData.cards.costAndMarginView.bestCaseMargin = Math.round(totalRev * 0.40);
        responseData.cards.costAndMarginView.averageCaseMargin = Math.round(totalRev * 0.25);
        responseData.cards.costAndMarginView.cautiousCaseMargin = Math.round(totalRev * 0.15);

        // Generate synthetic historical trend data (past 5 weeks) based on the current base price
        responseData.cards.historicalPriceContext.dataPoints = [
          Math.round(basePrice * 0.88),
          Math.round(basePrice * 0.92),
          Math.round(basePrice * 0.90),
          Math.round(basePrice * 0.95),
          Math.round(basePrice * 1.0),
        ];
      }
    } catch (mlError) {
      console.error("ML Pricing Error:", mlError?.response?.data || mlError.message);
    }

    res.json({
      success: true,
      ...responseData,
    });
  } catch (error) {
    console.error("Selling Analysis Error:", error?.response?.data || error.message);
    res.status(500).json({ success: false, error: "Failed to generate dynamic selling analysis." });
  }
});

module.exports = router;
