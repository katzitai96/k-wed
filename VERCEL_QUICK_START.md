# Wedding RSVP - Vercel Serverless Deployment Guide

## Quick Start

1. **Test the setup:**

   ```bash
   npm run test:setup
   ```

2. **Deploy to Vercel:**

   ```bash
   npm run deploy
   ```

3. **Test deployed API:**
   ```bash
   npm run test:deployed https://your-app.vercel.app
   ```

## Manual Deployment Steps

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Build and Deploy

```bash
npm run build:prod
vercel --prod
```

## Environment Variables Setup

After deployment, configure environment variables in your Vercel dashboard:

## API Endpoints

Your deployed application will have these endpoints:

- `GET /api/health` - Health check
- `POST /api/send-message` - Send single WhatsApp message
- `POST /api/send-bulk-messages` - Send bulk messages
- `POST /api/schedule-message` - Schedule messages
- `POST /api/webhook-response` - Twilio webhook handler

## Twilio Webhook Configuration

1. Go to your Twilio Console
2. Navigate to WhatsApp > Settings > Sandbox Settings
3. Update the webhook URL to: `https://your-app.vercel.app/api/webhook-response`

## Testing the Deployment

### Health Check

```bash
curl https://your-app.vercel.app/api/health
```

### Send Test Message

```bash
curl -X POST https://your-app.vercel.app/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "to": "whatsapp:+1234567890",
    "body": "Test message from Vercel deployment"
  }'
```

## Local Development

For local development, continue using:

```bash
npm run start:dev
```

This runs both the Angular app and the original Express server for development.

## Project Structure

```
├── api/                    # Vercel serverless functions
│   ├── _utils.js          # Shared utilities
│   ├── health.js          # Health check endpoint
│   ├── send-message.js    # Single message sender
│   ├── send-bulk-messages.js # Bulk message sender
│   ├── schedule-message.js # Message scheduler
│   └── webhook-response.js # Twilio webhook handler
├── src/                   # Angular application
├── vercel.json           # Vercel configuration
└── package.json          # Build scripts
```

## Troubleshooting

### Common Issues

1. **Build Fails**

   - Check that all dependencies are installed: `npm install`
   - Verify Angular build works: `npm run build:prod`

2. **Function Timeouts**

   - Vercel free tier has 10-second timeout
   - Optimize bulk message sending for smaller batches

3. **Environment Variables Not Working**

   - Double-check variable names in Vercel dashboard
   - Ensure no extra spaces in values

4. **Webhook Not Receiving Messages**
   - Verify webhook URL is correctly set in Twilio
   - Check function logs in Vercel dashboard
   - Ensure webhook URL includes full domain and path

### Debugging

- Check Vercel function logs in the dashboard
- Use the health endpoint to verify deployment
- Test individual API endpoints with curl
- Monitor Twilio webhook logs

## Migration Notes

- Original Express server (`src/app/server/server.js`) is kept for local development
- All API routes have been converted to individual serverless functions
- CORS is handled automatically by each function
- Database connections are established per function call (stateless)

## Performance Considerations

- Each function cold starts independently
- Database connections are created per request
- Consider implementing connection pooling for high traffic
- Bulk operations are limited by Vercel's execution time limits
