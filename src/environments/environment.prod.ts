// Production environment configuration
// Values will be injected from Vercel environment variables during build

export const environment = {
  production: true,
  supabaseUrl: 'PLACEHOLDER_SUPABASE_URL',
  supabaseKey: 'PLACEHOLDER_SUPABASE_KEY',
  supabaseServiceKey: 'PLACEHOLDER_SUPABASE_SERVICE_KEY',
  twilioAccountSid: 'PLACEHOLDER_TWILIO_ACCOUNT_SID',
  twilioAuthToken: 'PLACEHOLDER_TWILIO_AUTH_TOKEN',
  twilioPhoneNumber: 'PLACEHOLDER_TWILIO_PHONE_NUMBER',
  apiUrl: '/api', // Will use relative paths in production (Vercel)
};
