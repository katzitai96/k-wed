// This is an example environment file.
// Copy this file to environment.ts and environment.prod.ts and fill in your actual values

export const environment = {
  production: false,
  supabaseUrl: process.env['SUPABASE_URL'] || '',
  supabaseKey: process.env['SUPABASE_ANON_KEY'] || '',
  supabaseServiceKey: process.env['SUPABASE_SERVICE_KEY'] || '',
  twilioAccountSid: process.env['TWILIO_ACCOUNT_SID'] || '',
  twilioAuthToken: process.env['TWILIO_AUTH_TOKEN'] || '',
  twilioPhoneNumber: process.env['TWILIO_PHONE_NUMBER'] || '',
  apiUrl: 'http://localhost:3000/api',
};
