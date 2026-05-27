// WhatsApp (Twilio) integration — temporarily disabled
// To re-enable: uncomment the block below and ensure TWILIO_* env vars are set

/*
const twilio = require('twilio');
require('dotenv').config();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendWhatsApp(toPhone, message) {
    try {
        await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: `whatsapp:+91${toPhone}`,
            body: message
        });
        console.log(`WhatsApp message sent to +91${toPhone}`);
        return true;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        return false;
    }
}
*/

// Stub — always resolves silently
async function sendWhatsApp(toPhone, message) {
    console.log(`[WhatsApp DISABLED] Would have sent to +91${toPhone}: ${message}`);
    return false;
}

module.exports = { sendWhatsApp };
