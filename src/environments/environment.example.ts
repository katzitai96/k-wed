// This is an example environment file.
// Copy this file to environment.ts and fill in your actual values
// DO NOT COMMIT REAL VALUES TO GIT

export const environment = {
  production: false,
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseKey: 'YOUR_SUPABASE_ANON_KEY',
  supabaseServiceKey: 'YOUR_SUPABASE_SERVICE_KEY', // Add this for admin operations
  twilioAccountSid: 'YOUR_TWILIO_ACCOUNT_SID',
  twilioAuthToken: 'YOUR_TWILIO_AUTH_TOKEN',
  twilioPhoneNumber: 'whatsapp:+YOUR_PHONE_NUMBER',
  apiUrl: 'http://localhost:3000/api',
};
