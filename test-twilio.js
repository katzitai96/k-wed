#!/usr/bin/env node

const twilio = require("twilio");
const dotenv = require("dotenv");
const readline = require("readline");
const { createClient } = require("@supabase/supabase-js");

// Load environment variables
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function promptForCredentials() {
  let twilioSid = process.env.TWILIO_ACCOUNT_SID;
  let twilioToken = process.env.TWILIO_AUTH_TOKEN;
  let twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  let webhookUrl = process.env.WEBHOOK_URL;

  if (!twilioSid || twilioSid === "YOUR_TWILIO_ACCOUNT_SID") {
    twilioSid = await new Promise((resolve) => {
      rl.question("Enter your Twilio Account SID: ", resolve);
    });
  }

  if (!twilioToken || twilioToken === "YOUR_TWILIO_AUTH_TOKEN") {
    twilioToken = await new Promise((resolve) => {
      rl.question("Enter your Twilio Auth Token: ", resolve);
    });
  }

  if (!twilioNumber || twilioNumber === "whatsapp:+14155238886") {
    let phoneNumber = await new Promise((resolve) => {
      rl.question(
        'Enter your Twilio WhatsApp number (without "whatsapp:" prefix): ',
        resolve
      );
    });
    twilioNumber = `whatsapp:${phoneNumber}`;
  }

  if (
    !webhookUrl ||
    webhookUrl === "https://your-domain.com/api/webhook-response"
  ) {
    webhookUrl = await new Promise((resolve) => {
      rl.question(
        "Enter your webhook URL (for receiving responses): ",
        resolve
      );
    });
  }

  return { twilioSid, twilioToken, twilioNumber, webhookUrl };
}

async function testTwilioWhatsApp() {
  try {
    console.log("🚀 Testing Twilio WhatsApp Integration...");

    // Get credentials
    const { twilioSid, twilioToken, twilioNumber, webhookUrl } =
      await promptForCredentials();

    // Initialize Twilio client
    const client = twilio(twilioSid, twilioToken);

    // Get test phone number
    const testPhone = await new Promise((resolve) => {
      rl.question(
        "Enter your phone number to test WhatsApp (with country code, e.g., +1234567890): ",
        resolve
      );
    });

    console.log(
      `📱 Sending test message from ${twilioNumber} to ${testPhone}...`
    );

    // Send test message
    // await client.messages.create({
    //   from: twilioNumber,
    //   body: 'This is a test message from your Wedding RSVP app! 🎉 Reply with "Yes" to test the RSVP feature.',
    //   to: `whatsapp:${testPhone}`,
    // });

    client.messages
      .create({
        from: "whatsapp:+14155238886",
        contentSid: "HXb5b62575e6e4ff6129ad7c8efe1f983e",
        contentVariables: '{"1":"12/1","2":"3pm"}',
        to: "whatsapp:+972543313267",
      })
      .then((message) => console.log(message.sid));

    console.log("✅ Test message sent successfully!");
    console.log("");
    console.log("Please check your WhatsApp and respond to the message.");
    console.log("If this is your first interaction with this Twilio number,");
    console.log(
      'you might need to send the "join <code>" message to join the Twilio sandbox first.'
    );
    console.log("");

    // Update .env file
    console.log(
      "Do you want to update your .env file with these credentials? (yes/no)"
    );
    const updateEnv = await new Promise((resolve) => {
      rl.question("> ", resolve);
    });

    if (updateEnv.toLowerCase() === "yes" || updateEnv.toLowerCase() === "y") {
      // Implementation of .env update would go here
      console.log(
        "Feature not implemented. Please update your .env file manually."
      );
    }

    console.log("");
    console.log("Next steps:");
    console.log(
      "1. Make sure your Twilio WhatsApp sandbox is configured with your webhook URL"
    );
    console.log(`   Current webhook URL: ${webhookUrl}`);
    console.log(
      "2. Test responding to the message to check if your webhook works"
    );
    console.log("3. Run the full application to manage invitations");

    rl.close();
  } catch (error) {
    console.error("❌ Error testing Twilio WhatsApp:", error.message);
    rl.close();
    process.exit(1);
  }
}

testTwilioWhatsApp();
