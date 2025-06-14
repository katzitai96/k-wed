const twilio = require("twilio");
const { createClient } = require("@supabase/supabase-js");

// Initialize Twilio client
const getTwilioClient = () => {
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
};

// Initialize Supabase client
const getSupabaseClient = () => {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
};

// CORS headers for responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle CORS preflight requests
const handleCors = (req, res) => {
  if (req.method === "OPTIONS") {
    res.status(200).json({});
    return true;
  }

  // Set CORS headers for all responses
  Object.keys(corsHeaders).forEach((key) => {
    res.setHeader(key, corsHeaders[key]);
  });

  return false;
};

module.exports = {
  getTwilioClient,
  getSupabaseClient,
  handleCors,
  corsHeaders,
};
