const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const twilio = require("twilio");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");

// NOTE: This server has been migrated to Vercel serverless functions
// For Vercel deployment, see the files in ./api/ directory
// This file is kept for local development only

// Load environment variables - with path to the root directory
require("dotenv").config({
  path: path.resolve(__dirname, "../../../.env"),
});

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
  process.env.SUPABASE_ANON_KEY
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
          invitee_id: req.body.inviteeId || null,
          template_id: req.body.templateId || null,
          message_body: body,
          sent_at: new Date(),
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
              invitee_id: msgData.inviteeId || null,
              template_id: msgData.templateId || null,
              message_body: msgData.body,
              sent_at: new Date(),
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
          invitee_id: inviteeId || null,
          template_id: templateId || null,
          scheduled_date,
          created_at: new Date(),
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
    // Log the incoming request for debugging
    console.log("Webhook request received:", {
      headers: req.headers,
      body: req.body,
    });

    // Validate that we received a proper request
    if (!req.body) {
      console.error("Webhook received empty request body");
      return res.status(400).send("Bad Request: Empty body");
    }

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
    const from = req.body.From || "unknown";
    const body = req.body.Body ? req.body.Body.trim() : "";
    console.log(`Received message from ${from}: ${body}`);

    // Look up invitee by phone number
    let formattedPhone = from;

    // Remove WhatsApp prefix if present
    if (typeof from === "string") {
      formattedPhone = from.replace("whatsapp:", "");
    } else {
      console.error("Invalid 'From' field in webhook:", from);
      formattedPhone = "";
    }

    // Only proceed with database lookup if we have a valid phone number
    if (!formattedPhone) {
      console.error("Unable to extract valid phone number from webhook");
      return res.status(400).send("Bad Request: Invalid phone number");
    }

    const { data: invitees, error: lookupError } = await supabase
      .from("invitees")
      .select("*")
      .eq("phone_number", formattedPhone)
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
            rsvp_status: rsvpStatus,
            additional_info: invitee.additional_info
              ? `${
                  invitee.additional_info
                }\n${new Date().toISOString()}: ${body}`
              : `${new Date().toISOString()}: ${body}`,
            updated_at: new Date(),
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
            invitee_id: invitee.id,
            message_body: body,
            sent_at: new Date(),
            status: "delivered",
            response_received: true,
            response_text: body,
            response_received_at: new Date(),
          },
        ]);

      if (recordError) {
        console.error("Error recording message response:", recordError);
      }
    }

    try {
      // Send acknowledgment response
      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message("Thanks for your response! We've recorded your RSVP. 💕");

      res.type("text/xml");
      res.send(twiml.toString());
    } catch (responseError) {
      console.error("Error sending acknowledgment response:", responseError);
      res.status(500).send("Error processing webhook");
    }
  } catch (error) {
    console.error("Error handling webhook response:", error);

    // Log detailed error information
    console.error({
      message: error.message,
      stack: error.stack,
      requestBody: req.body,
      requestHeaders: req.headers,
    });

    // Make sure we respond even if there's an error
    if (!res.headersSent) {
      res.status(500).send("Error processing webhook");
    }
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
