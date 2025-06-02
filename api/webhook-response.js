const twilio = require("twilio");
const { getTwilioClient, getSupabaseClient, handleCors } = require("./_utils");

module.exports = async (req, res) => {
  // Handle CORS
  if (handleCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
};
