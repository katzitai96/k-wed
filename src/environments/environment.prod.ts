// Production environment configuration
// Using actual values for stable production deployment

export const environment = {
  production: true,
  supabaseUrl: 'https://dkgnefkamndmkzdsrwud.supabase.co',
  supabaseKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZ25lZmthbW5kbWt6ZHNyd3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODczODYsImV4cCI6MjA2MzI2MzM4Nn0.vyeQ0f8JaHOfwJi_j0W3Ly2TRrQl2L2utBOhd94xdbc',
  supabaseServiceKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZ25lZmthbW5kbWt6ZHNyd3VkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzY4NzM4NiwiZXhwIjoyMDYzMjYzMzg2fQ.TArlB4AjogD4zLijO397fpdb53W6aJsTWAksGkNJD3Y',
  twilioAccountSid: '', // Not needed for WhatsApp Cloud API
  twilioAuthToken: '', // Not needed for WhatsApp Cloud API
  twilioPhoneNumber: '', // Not needed for WhatsApp Cloud API
  apiUrl: '/api', // Will use relative paths in production (Vercel)
};
