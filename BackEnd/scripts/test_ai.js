const axios = require("axios");

async function testPrediction() {
  const payload = {
    temperature: 32,
    humidity: 60,
    rainfall: 400,
    soil_ph: 6.8,
    ndvi: 0.6,
    crop_type: "Maize"
  };

  try {
    console.log("Sending prediction request...");
    const response = await axios.post("http://localhost:5000/api/crop-prediction", payload);
    console.log("Response:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("Test failed:", error.response ? error.response.data : error.message);
  }
}

testPrediction();
