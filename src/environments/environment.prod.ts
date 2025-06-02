// Production environment configuration
// Values will be injected from Vercel environment variables during build

export const environment = {
  production: true,
  supabaseUrl: process.env['SUPABASE_URL'] || '',
  supabaseKey: process.env['SUPABASE_ANON_KEY'] || '',
  supabaseServiceKey: process.env['SUPABASE_SERVICE_KEY'] || '',
  twilioAccountSid: process.env['TWILIO_ACCOUNT_SID'] || '',
  twilioAuthToken: process.env['TWILIO_AUTH_TOKEN'] || '',
  twilioPhoneNumber: process.env['TWILIO_PHONE_NUMBER'] || '',
  apiUrl: '/api', // Will use relative paths in production (Vercel)
};
