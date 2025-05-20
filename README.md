# Wedding RSVP Management Application

A comprehensive wedding RSVP management application built with Angular, TypeScript, Twilio for WhatsApp messaging, and Supabase for database storage.

## Features

- **WhatsApp Integration**: Send and receive RSVP messages, invitations, and wedding information directly through WhatsApp
- **Invitee Management**: Track guests, their relationships, contact details, and RSVP status
- **Response Tracking**: Monitor responses and follow up with non-respondents
- **Dashboard View**: Get an overview of confirmed guests, pending responses, and important metrics
- **Excel Export**: Export guest data for planning and coordination
- **Message Templates**: Create and manage reusable message templates for different purposes

## Tech Stack

- **Frontend**: Angular, Angular Material, TypeScript
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Messaging**: Twilio WhatsApp API
- **Reporting**: Excel.js for data export

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- Angular CLI
- Supabase Account
- Twilio Account with WhatsApp capability

### Environment Setup

1. Copy `src/environments/environment.example.ts` to `src/environments/environment.ts` and `src/environments/environment.prod.ts`
2. Update both files with your own credentials:
   - Supabase URL and key
   - Twilio account SID, auth token, and phone number
   - API URL

> **IMPORTANT**: Never commit environment files with real credentials to the repository. They are included in the `.gitignore` file to prevent accidental commits.

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the database:
   ```bash
   npm run setup:db
   ```
4. Configure environment variables (see SETUP.md for detailed instructions)
5. Run the application:
   ```bash
   npm run start:dev
   ```

## Development

### Development server

To start the Angular development server only:

```bash
npm start
```

To start both the Angular app and Express server concurrently:

```bash
npm run start:dev
```

### Testing Twilio Integration

To test WhatsApp messaging functionality:

```bash
npm run test:twilio
```

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
