const { getTwilioClient, getSupabaseClient, handleCors } = require("./_utils");

module.exports = async (req, res) => {
  // Handle CORS
  if (handleCors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { to, body, inviteeId, templateId } = req.body;

    if (!to || !body) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: to, body",
      });
    }

    const twilioClient = getTwilioClient();
    const supabase = getSupabaseClient();

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
          invitee_id: inviteeId || null,
          template_id: templateId || null,
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
};
