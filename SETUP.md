# Wedding RSVP Management Application Setup Guide

This guide will help you set up your Wedding RSVP Management Application using Angular, Supabase, and Twilio for WhatsApp messaging.

## Prerequisites

1. [Node.js](https://nodejs.org/) (v16 or later)
2. [Angular CLI](https://angular.io/cli) (v16 or later)
3. [Supabase Account](https://supabase.io/) (Free tier is sufficient for most weddings)
4. [Twilio Account](https://www.twilio.com/) with WhatsApp capability

## Setup Steps

### 1. Install Dependencies

```bash
# Navigate to the project directory
cd wedding-rsvp-app

# Install dependencies
npm install
```

### 2. Set Up Supabase Database

1. Create a new project in Supabase
2. Navigate to the SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `supabase-schema.sql` file from the project root
4. Execute the SQL to create the necessary tables and schemas

### 3. Configure Environment Variables

1. Update the Supabase credentials in the following files:

   - `src/environments/environment.ts`
   - `src/environments/environment.prod.ts`
   - `.env` file in the project root

   You can find your Supabase URL and key in your Supabase project settings under "API" tab.

2. Update the Twilio credentials in the same files:

   - Twilio Account SID
   - Twilio Auth Token
   - Twilio WhatsApp Number (format: `whatsapp:+1234567890`)

   You can find these in your Twilio Console dashboard.

### 4. Set Up Twilio for WhatsApp

1. Set up a WhatsApp sandbox in Twilio (or use a production WhatsApp number if available)
2. Configure a webhook URL for incoming messages:
   - In development: Use a service like [ngrok](https://ngrok.com/) to expose your local server
   - In production: Use your domain + `/api/webhook-response`
3. Update the `WEBHOOK_URL` in the `.env` file

### 5. Run the Application

#### Development Mode

```bash
# In one terminal, run the Angular application
ng serve

# In another terminal, run the Express server
node src/app/server/server.js
```

#### Production Mode

```bash
# Build the application
ng build --configuration=production

# Run the server (which will serve the Angular app)
node src/app/server/server.js
```

## Testing WhatsApp Messaging

1. Add yourself as an invitee in the application
2. Join your Twilio WhatsApp sandbox by sending the join code to the provided number
3. Try sending a test message from the application

## Next Steps

1. Set up authentication for admin access (optionally using Supabase Auth)
2. Deploy to a production environment
3. Customize message templates for your wedding
4. Add more features like guest meal choices or accommodation preferences

## Troubleshooting

- Ensure your WhatsApp number is formatted correctly (add '+' before the country code)
- Check Twilio logs for messaging issues
- Review Supabase logs for database operation issues

## Security Notes

- Keep your Twilio and Supabase credentials secure
- Do not commit your `.env` file to public repositories
- Apply proper authentication before deploying to production
