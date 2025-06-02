# Vercel Deployment Setup

This document outlines how to deploy the Wedding RSVP application to Vercel as serverless functions.

## Architecture Changes

The Express.js server has been converted to individual serverless functions:

- `api/send-message.js` - Send single WhatsApp message
- `api/send-bulk-messages.js` - Send bulk WhatsApp messages
- `api/schedule-message.js` - Schedule messages for later
- `api/webhook-response.js` - Handle Twilio webhook responses
- `api/health.js` - Health check endpoint
- `api/_utils.js` - Shared utilities for all functions

## Project Structure

```
c:\develop\k-wed\
├── api/                     # Serverless functions (Vercel)
│   ├── _utils.js           # Shared utilities
│   ├── health.js           # Health check
│   ├── send-message.js     # Single message
│   ├── send-bulk-messages.js # Bulk messages
│   ├── schedule-message.js # Scheduled messages
│   └── webhook-response.js # Twilio webhook
├── src/                    # Angular application
├── vercel.json            # Vercel configuration
└── package.json           # Build scripts
```

## Pre-Deployment Checklist

✅ All serverless functions are in `/api` directory  
✅ `vercel.json` configuration is correct  
✅ `package.json` has `vercel-build` script  
✅ Environment variables are documented  
✅ Production environment file is configured

Run the setup test:

```bash
node test-vercel-setup.js
```

## Environment Variables

Set these environment variables in your Vercel dashboard:

1. `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
2. `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
3. `TWILIO_WHATSAPP_NUMBER` - Your Twilio WhatsApp number (format: whatsapp:+1234567890)
4. `SUPABASE_URL` - Your Supabase project URL
5. `SUPABASE_KEY` - Your Supabase anon/public key
6. `WEBHOOK_URL` - Full URL to your webhook endpoint (e.g., https://yourapp.vercel.app/api/webhook-response)

## Deployment Steps

1. **Connect to Vercel:**

   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Initial deployment:**

   ```bash
   vercel
   ```

3. **Set environment variables:**

   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add all environment variables listed above

4. **Update Twilio webhook URL:**

   - In your Twilio console, update the webhook URL for your WhatsApp sandbox/number
   - Set it to: `https://your-app-name.vercel.app/api/webhook-response`

5. **Deploy production:**
   ```bash
   vercel --prod
   ```

## API Endpoints

After deployment, your API endpoints will be available at:

- `POST /api/send-message` - Send single message
- `POST /api/send-bulk-messages` - Send bulk messages
- `POST /api/schedule-message` - Schedule message
- `POST /api/webhook-response` - Twilio webhook (for receiving responses)

## Local Development

For local development, you can still use the original Express server:

```bash
npm run start:server
```

Or run both the Angular app and server:

```bash
npm run start:dev
```

## Notes

- Each serverless function has a 10-second execution limit on Vercel's free tier
- The webhook function is optimized to handle Twilio's request format
- CORS is handled automatically for all API endpoints
- All functions include proper error handling and logging

## Troubleshooting

1. **Webhook not receiving messages:**

   - Check that the webhook URL is correctly set in Twilio
   - Verify environment variables are set correctly
   - Check Vercel function logs for errors

2. **Messages not sending:**

   - Verify Twilio credentials are correct
   - Check that the WhatsApp number is properly formatted
   - Ensure Supabase connection is working

3. **Database errors:**
   - Verify Supabase URL and key are correct
   - Check that database tables exist and have correct permissions
