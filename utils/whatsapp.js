const twilio = require('twilio');

// ✅ Real Twilio WhatsApp integration
let subscribers = ["+917908250388"]; // start with first donor

// Send WhatsApp broadcast using real Twilio
async function sendWhatsAppBroadcast(donorNumber, message) {
  try {
    // Add donor to subscriber list if not already
    if (!subscribers.includes(donorNumber)) {
      subscribers.push(donorNumber);
    }

    console.log("📱 WhatsApp Broadcast to:", subscribers);

    // Create Twilio client
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    // Send to everyone in subscriber list
    for (const to of subscribers) {
      try {
        const response = await client.messages.create({
          from: process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886",
          to: `whatsapp:${to}`,
          body: message,
        });
        console.log(`✅ WhatsApp message sent to ${to}: ${response.sid}`);
      } catch (error) {
        console.error(`❌ Error sending to ${to}:`, error.message);
      }
    }
    
    console.log("✅ WhatsApp broadcast completed successfully!");
  } catch (error) {
    console.error("❌ WhatsApp broadcast error:", error.message);
    // Fallback to console log if Twilio fails
    console.log("📱 WhatsApp Broadcast Simulation:");
    console.log("Broadcasting to:", subscribers);
    console.log("Message:", message);
  }
}

module.exports = { sendWhatsAppBroadcast };
