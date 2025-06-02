const { getTwilioClient, getSupabaseClient, handleCors } = require('./_utils');

module.exports = async (req, res) => {
  // Handle CORS
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing or invalid messages array' 
      });
    }

    const twilioClient = getTwilioClient();
    const supabase = getSupabaseClient();
    
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
};
