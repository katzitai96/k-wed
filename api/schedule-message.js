const { getSupabaseClient, handleCors } = require('./_utils');

module.exports = async (req, res) => {
  // Handle CORS
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, body, scheduledDate, inviteeId, templateId } = req.body;

    if (!to || !body || !scheduledDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, body, scheduledDate' 
      });
    }

    const supabase = getSupabaseClient();

    // Store the scheduled message in the database with a 'scheduled' status
    const { data, error } = await supabase
      .from("scheduled_messages")
      .insert([
        {
          to,
          body,
          invitee_id: inviteeId || null,
          template_id: templateId || null,
          scheduled_date: scheduledDate,
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
};
