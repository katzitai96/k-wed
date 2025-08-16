#!/usr/bin/env node

// Test script for WhatsApp Cloud API
// Usage: node test-whatsapp-cloud.js

const { sendTextMessage, getWhatsAppConfig } = require("./api/_whatsapp-utils");

async function testWhatsAppAPI() {
  console.log("🧪 Testing WhatsApp Cloud API...");

  // Check configuration
  const config = getWhatsAppConfig();

  console.log("Configuration check:");
  console.log(
    "- Phone Number ID:",
    config.phoneNumberId ? "✅ Set" : "❌ Missing"
  );
  console.log("- Access Token:", config.accessToken ? "✅ Set" : "❌ Missing");
  console.log("- WABA ID:", config.wabaId ? "✅ Set" : "❌ Missing");
  console.log(
    "- Webhook Verify Token:",
    config.webhookVerifyToken ? "✅ Set" : "❌ Missing"
  );

  if (!config.phoneNumberId || !config.accessToken) {
    console.error(
      "\n❌ Missing required configuration. Please set environment variables:"
    );
    console.error("- WHATSAPP_PHONE_NUMBER_ID");
    console.error("- WHATSAPP_ACCESS_TOKEN");
    return;
  }

  // Test message (replace with your test WhatsApp number)
  const testPhoneNumber = process.env.TEST_PHONE_NUMBER || "1234567890"; // Replace with your test number
  const testMessage =
    "Hello! This is a test message from your Wedding RSVP app. 💒";

  if (testPhoneNumber === "1234567890") {
    console.log(
      "\n⚠️  Please set TEST_PHONE_NUMBER environment variable to your test WhatsApp number"
    );
    console.log(
      "Example: TEST_PHONE_NUMBER=1234567890 node test-whatsapp-cloud.js"
    );
    return;
  }

  try {
    console.log(`\n📱 Sending test message to ${testPhoneNumber}...`);
    const response = await sendTextMessage(testPhoneNumber, testMessage);

    console.log("✅ Message sent successfully!");
    console.log("Response:", JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("❌ Error sending message:", error.message);

    if (error.response?.data) {
      console.error(
        "API Error Details:",
        JSON.stringify(error.response.data, null, 2)
      );
    }

    // Common error troubleshooting
    if (error.response?.status === 401) {
      console.error("\n💡 Troubleshooting: Check your WHATSAPP_ACCESS_TOKEN");
    } else if (error.response?.status === 400) {
      console.error(
        "\n💡 Troubleshooting: Check your phone number format and WHATSAPP_PHONE_NUMBER_ID"
      );
    }
  }
}

// Run the test
if (require.main === module) {
  // Load environment variables
  require("dotenv").config();
  testWhatsAppAPI();
}

module.exports = { testWhatsAppAPI };
