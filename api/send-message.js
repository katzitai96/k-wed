const { getSupabaseClient, handleCors } = require("./_utils");
const { sendTextMessage } = require("./_whatsapp-utils");

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

    const supabase = getSupabaseClient();

    // Send message via WhatsApp Cloud API
    const whatsappResponse = await sendTextMessage(to, body);

    // Record message in database
    const { data: messageRecord, error: dbError } = await supabase
      .from("message_history")
      .insert([
        {
          invitee_id: inviteeId || null,
          template_id: templateId || null,
          message_body: body,
          sent_at: new Date(),
          status: "sent",
          whatsapp_message_id: whatsappResponse.messages?.[0]?.id || null,
        },
      ])
      .select();

    if (dbError) {
      console.error("Error recording message to database:", dbError);
    }

    res.json({
      success: true,
      whatsappMessageId: whatsappResponse.messages?.[0]?.id,
      messageHistoryId: messageRecord?.[0]?.id,
      whatsappResponse: whatsappResponse,
    });
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);

    // Return more detailed error information
    const errorMessage = error.response?.data?.error?.message || error.message;
    const errorCode = error.response?.data?.error?.code || "UNKNOWN_ERROR";

    res.status(500).json({
      success: false,
      error: errorMessage,
      errorCode: errorCode,
      details: error.response?.data || null,
    });
  }
};
