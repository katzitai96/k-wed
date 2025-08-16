const { getSupabaseClient, handleCors } = require("./_utils");
const {
  parseWebhookPayload,
  verifyWebhookSignature,
  getWhatsAppConfig,
} = require("./_whatsapp-utils");

module.exports = async (req, res) => {
  // Handle CORS
  if (handleCors(req, res)) return;

  // Handle webhook verification (GET request)
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const config = getWhatsAppConfig();

    if (mode === "subscribe" && token === config.webhookVerifyToken) {
      console.log("Webhook verified successfully");
      return res.status(200).send(challenge);
    } else {
      console.error("Webhook verification failed");
      return res.status(403).send("Forbidden");
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Log the incoming request for debugging
    console.log("WhatsApp webhook request received:", {
      headers: req.headers,
      body: req.body,
    });

    // Validate that we received a proper request
    if (!req.body) {
      console.error("Webhook received empty request body");
      return res.status(400).send("Bad Request: Empty body");
    }

    // Parse WhatsApp webhook payload
    const messageData = parseWebhookPayload(req.body);

    if (!messageData) {
      console.log("No message data found in webhook, might be a status update");
      return res.status(200).send("OK");
    }

    const { from, text: messageText, messageId } = messageData;
    console.log(`Received WhatsApp message from ${from}: ${messageText}`);

    // Only proceed with database lookup if we have a valid phone number
    if (!formattedPhone) {
      console.error("Unable to extract valid phone number from webhook");
      return res.status(400).send("Bad Request: Invalid phone number");
    }

    const supabase = getSupabaseClient();

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

      const lowercaseText = messageText.toLowerCase();
      if (
        lowercaseText.includes("yes") ||
        lowercaseText.includes("attending") ||
        lowercaseText.includes("will attend")
      ) {
        rsvpStatus = "confirmed";
      } else if (
        lowercaseText.includes("no") ||
        lowercaseText.includes("not attending") ||
        lowercaseText.includes("cannot attend")
      ) {
        rsvpStatus = "declined";
      } else if (
        lowercaseText.includes("maybe") ||
        lowercaseText.includes("possibly")
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
                }\n${new Date().toISOString()}: ${messageText}`
              : `${new Date().toISOString()}: ${messageText}`,
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
            message_body: messageText,
            sent_at: new Date(),
            status: "delivered",
            response_received: true,
            response_text: messageText,
            response_received_at: new Date(),
            whatsapp_message_id: messageId,
          },
        ]);

      if (recordError) {
        console.error("Error recording message response:", recordError);
      }
    }

    // For WhatsApp Cloud API, we just need to return 200 OK
    // No need to send a TwiML response like with Twilio
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error handling WhatsApp webhook:", error);

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
};
