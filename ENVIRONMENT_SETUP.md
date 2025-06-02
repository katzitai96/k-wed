# Environment Variables Setup for Vercel Deployment

## Overview

This application uses environment variables for configuration. In development, these are read from local environment files. In production (Vercel), they are injected from Vercel's environment variables during the build process.

## Required Environment Variables

Set these environment variables in your Vercel dashboard:

### Database (Supabase)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anon/public key  
- `SUPABASE_SERVICE_KEY` - Your Supabase service role key (for admin operations)

### Messaging (Twilio)
- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
- `TWILIO_PHONE_NUMBER` - Your Twilio WhatsApp-enabled phone number (format: whatsapp:+1234567890)

## Setting Environment Variables in Vercel

### Via Vercel Dashboard
1. Go to your project in the Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with the appropriate values
4. Make sure to set them for "Production", "Preview", and "Development" environments

### Via Vercel CLI
```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_KEY
vercel env add SUPABASE_SERVICE_KEY
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN
vercel env add TWILIO_PHONE_NUMBER
```

## Current Values (for reference)

⚠️ **SECURITY NOTE**: The actual values are not shown here for security reasons.

You need to obtain these values from your service providers:

- **SUPABASE_URL**: Get from your Supabase project dashboard
- **SUPABASE_KEY**: Get the "anon public" key from your Supabase project
- **SUPABASE_SERVICE_KEY**: Get the "service_role" key from your Supabase project  
- **TWILIO_ACCOUNT_SID**: Get from your Twilio Console
- **TWILIO_AUTH_TOKEN**: Get from your Twilio Console
- **TWILIO_PHONE_NUMBER**: Your Twilio WhatsApp-enabled number (format: whatsapp:+1234567890)

## How It Works

1. **Development**: Environment variables are read from `src/environments/environment.ts`
2. **Production**: 
   - During build, `scripts/inject-env.js` reads Vercel environment variables
   - It replaces placeholders in `environment.prod.ts` with actual values
   - Angular build process uses the updated `environment.prod.ts`

## Deployment Process

After setting up environment variables in Vercel:

1. Deploy: `vercel --prod`
2. The build process will automatically inject environment variables
3. Your application will use the production values

## Security Notes

- Never commit real environment values to git
- Use Vercel's environment variable encryption for sensitive data
- The `environment.prod.ts` file contains only placeholders in the repository
- Real values are injected only during the build process on Vercel
