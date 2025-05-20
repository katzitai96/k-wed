const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const twilio = require("twilio");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");

// Load environment variables - with path to the root directory
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Debug environment variables
console.log("Environment variables loaded:");
console.log("- PORT:", process.env.PORT);
console.log(
  "- TWILIO_ACCOUNT_SID:",
  process.env.TWILIO_ACCOUNT_SID ? "Found" : "Missing"
);
console.log(
  "- TWILIO_AUTH_TOKEN:",
  process.env.TWILIO_AUTH_TOKEN ? "Found" : "Missing"
);
console.log("- TWILIO_WHATSAPP_NUMBER:", process.env.TWILIO_WHATSAPP_NUMBER);
console.log("- SUPABASE_URL:", process.env.SUPABASE_URL ? "Found" : "Missing");
console.log("- SUPABASE_KEY:", process.env.SUPABASE_KEY ? "Found" : "Missing");

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Serve static files from Angular app
app.use(express.static("dist/wedding-rsvp"));

// API Routes

// Send single WhatsApp message
app.post("/api/send-message", async (req, res) => {
  try {
    const { to, body } = req.body;

    const message = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to,
      body,
    });

    // Record message in database
    const { data: messageRecord, error: dbError } = await supabase
      .from("message_history")
      .insert([
        {
          inviteeId: req.body.inviteeId || null,
          templateId: req.body.templateId || null,
          messageBody: body,
          sentAt: new Date(),
          status: "pending",
        },
      ])
      .select();

    if (dbError) {
      console.error("Error recording message to database:", dbError);
    }

    res.json({
      success: true,
      messageSid: message.sid,
      messageHistoryId: messageRecord?.[0]?.id,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send bulk WhatsApp messages
app.post("/api/send-bulk-messages", async (req, res) => {
  try {
    const { messages } = req.body;
    const results = [];
    const errors = [];

    // Send messages one by one to avoid rate limiting
    for (const msgData of messages) {
      try {
        const message = await twilioClient.messages.create({
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          to: msgData.to,
          body: msgData.body,
        });

        // Record message in database
        const { data: messageRecord, error: dbError } = await supabase
          .from("message_history")
          .insert([
            {
              inviteeId: msgData.inviteeId || null,
              templateId: msgData.templateId || null,
              messageBody: msgData.body,
              sentAt: new Date(),
              status: "pending",
            },
          ])
          .select();

        if (dbError) {
          console.error("Error recording message to database:", dbError);
        }

        results.push({
          to: msgData.to,
          messageSid: message.sid,
          messageHistoryId: messageRecord?.[0]?.id,
        });
      } catch (error) {
        errors.push({ to: msgData.to, error: error.message });
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    res.json({ success: true, results, errors });
  } catch (error) {
    console.error("Error sending bulk messages:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Schedule a message for later sending
app.post("/api/schedule-message", async (req, res) => {
  try {
    const { to, body, scheduledDate, inviteeId, templateId } = req.body;

    // Store the scheduled message in the database with a 'scheduled' status
    const { data, error } = await supabase
      .from("scheduled_messages")
      .insert([
        {
          to,
          body,
          inviteeId: inviteeId || null,
          templateId: templateId || null,
          scheduledDate,
          createdAt: new Date(),
        },
      ])
      .select();

    if (error) {
      throw error;
    }

    res.json({ success: true, scheduledMessageId: data[0].id });
  } catch (error) {
    console.error("Error scheduling message:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook for receiving WhatsApp replies
app.post("/api/webhook-response", async (req, res) => {
  try {
    const twilioSignature = req.headers["x-twilio-signature"];

    // Validate Twilio request
    const requestIsValid = twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN,
      twilioSignature,
      process.env.WEBHOOK_URL, // Full URL to this endpoint
      req.body
    );

    if (!requestIsValid && process.env.NODE_ENV === "production") {
      return res.status(403).send("Forbidden");
    }

    const from = req.body.From;
    const body = req.body.Body.trim();

    console.log(`Received message from ${from}: ${body}`);

    // Look up invitee by phone number
    const formattedPhone = from.replace("whatsapp:", "");
    const { data: invitees, error: lookupError } = await supabase
      .from("invitees")
      .select("*")
      .eq("phoneNumber", formattedPhone)
      .limit(1);

    if (lookupError) {
      console.error("Error looking up invitee:", lookupError);
    }

    const invitee = invitees?.[0];

    if (invitee) {
      // Process RSVP response
      let rsvpStatus = "pending";

      const lowercaseBody = body.toLowerCase();
      if (
        lowercaseBody.includes("yes") ||
        lowercaseBody.includes("attending") ||
        lowercaseBody.includes("will attend")
      ) {
        rsvpStatus = "confirmed";
      } else if (
        lowercaseBody.includes("no") ||
        lowercaseBody.includes("not attending") ||
        lowercaseBody.includes("cannot attend")
      ) {
        rsvpStatus = "declined";
      } else if (
        lowercaseBody.includes("maybe") ||
        lowercaseBody.includes("possibly")
      ) {
        rsvpStatus = "maybe";
      }

      if (rsvpStatus !== "pending") {
        // Update invitee RSVP status
        const { error: updateError } = await supabase
          .from("invitees")
          .update({
            rsvpStatus,
            additionalInfo: invitee.additionalInfo
              ? `${
                  invitee.additionalInfo
                }\n${new Date().toISOString()}: ${body}`
              : `${new Date().toISOString()}: ${body}`,
            updatedAt: new Date(),
          })
          .eq("id", invitee.id);

        if (updateError) {
          console.error("Error updating invitee RSVP status:", updateError);
        }
      }

      // Record the message response
      const { error: recordError } = await supabase
        .from("message_history")
        .insert([
          {
            inviteeId: invitee.id,
            messageBody: body,
            sentAt: new Date(),
            status: "delivered",
            responseReceived: true,
            responseText: body,
            responseReceivedAt: new Date(),
          },
        ]);

      if (recordError) {
        console.error("Error recording message response:", recordError);
      }
    }

    // Send acknowledgment response
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message("Thanks for your response! We've recorded your RSVP. 💕");

    res.type("text/xml");
    res.send(twiml.toString());
  } catch (error) {
    console.error("Error handling webhook response:", error);
    res.status(500).send("Error processing webhook");
  }
});

// For any other routes, serve the Angular app
app.get("*", (req, res) => {
  res.sendFile("dist/wedding-rsvp/index.html", { root: __dirname });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
