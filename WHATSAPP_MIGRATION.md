# WhatsApp Cloud API Migration Guide

## Overview

Your app has been updated to use WhatsApp Cloud API instead of Twilio. This provides better control, lower costs, and direct integration with Meta's WhatsApp Business Platform.

## What Changed

- ✅ Replaced Twilio with WhatsApp Cloud API
- ✅ Updated all API endpoints (send-message, send-bulk-messages, webhook-response)
- ✅ Added new environment variables for WhatsApp configuration
- ✅ Updated webhook handling for WhatsApp format
- ✅ Added WhatsApp message ID tracking in database

## Required Information from Your Meta App

Please provide the following from your Meta Developer Account:

### 1. Phone Number ID

- Go to your Meta App → WhatsApp → API Setup
- Copy the "Phone number ID" from your test number

### 2. Access Token

- In the same API Setup page, copy the temporary access token
- For production, you'll need to generate a permanent token

### 3. WABA ID (WhatsApp Business Account ID)

- Found in your Meta Business Manager or WhatsApp Business Account settings

### 4. Webhook Verify Token

- This is a custom token you create for webhook verification
- Use any secure random string (e.g., `my-secure-webhook-token-123`)

### 5. App ID & App Secret (for webhook verification)

- Found in your Meta App → Settings → Basic

## Setup Steps

### 1. Install Dependencies

```bash
npm install axios
```

### 2. Update Environment Variables

Create a `.env` file with:

```env
# WhatsApp Cloud API Configuration
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id_here
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_custom_verify_token_here

# Meta App Configuration
META_APP_ID=your_app_id_here
META_APP_SECRET=your_app_secret_here

# Existing Supabase config...
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

### 3. Update Database Schema

Run the migration SQL in your Supabase SQL editor:

```sql
-- Add WhatsApp message ID column
ALTER TABLE message_history
ADD COLUMN whatsapp_message_id TEXT;

CREATE INDEX IF NOT EXISTS idx_message_history_whatsapp_id
ON message_history(whatsapp_message_id);
```

### 4. Configure Webhook in Meta App

1. Go to your Meta App → WhatsApp → Configuration
2. Set webhook URL to: `https://your-app.vercel.app/api/webhook-response`
3. Set verify token to the same value as `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
4. Subscribe to `messages` webhook field

### 5. Test the Integration

```bash
# Set your test WhatsApp number
export TEST_PHONE_NUMBER=1234567890

# Run the test script
node test-whatsapp-cloud.js
```

## Vercel Environment Variables

Set these in your Vercel project settings:

- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `META_APP_ID`
- `META_APP_SECRET`

## Important Notes

### Rate Limits

- Cloud API has different rate limits than Twilio
- Test apps: 250 messages per day
- Business verified: Much higher limits

### Phone Number Format

- Use international format without `+` or `whatsapp:` prefix
- Example: `1234567890` (not `+1234567890` or `whatsapp:+1234567890`)

### Message Templates

- For marketing messages, you'll need approved message templates
- Customer service messages (replies within 24 hours) can be free-form text

### Testing

- Make sure to test with your registered test phone number
- Check Meta App dashboard for message logs and debugging

## Troubleshooting

### Common Errors

1. **401 Unauthorized**: Check your access token
2. **400 Bad Request**: Check phone number format and phone number ID
3. **Rate Limited**: Reduce message frequency
4. **Webhook not receiving**: Check URL and verify token

### Getting Help

- Check Meta Developer documentation: https://developers.facebook.com/docs/whatsapp/cloud-api
- Use the test script to verify configuration
- Check Vercel function logs for debugging

## Next Steps

1. Provide the required information above
2. Test with the test script
3. Deploy to Vercel with new environment variables
4. Configure webhook in Meta App
5. Test end-to-end flow
