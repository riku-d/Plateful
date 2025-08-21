const axios = require('axios');

// 🔹 Function to get expiry hours from Flask API
async function calculateExpiryHours(foodType, temperature, humidity, packaging) {
  try {
    const response = await axios.post('http://127.0.0.1:4000/predict', {
      Food_Type: foodType,      // match your Flask API keys
      Storage_Temp: temperature,
      Humidity: humidity,
      Packaging: packaging
    });

    // Flask now returns a number directly
    return response.data; // e.g., 5
  } catch (err) {
    console.error('❌ Error fetching expiry hours from Flask API:', err.message);
    // fallback in case Flask API fails
    return 6; // default hours
  }
}

module.exports = { calculateExpiryHours };
