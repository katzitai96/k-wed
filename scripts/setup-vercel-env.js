#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('Setting up environment variables in Vercel...');

// You need to set these values before running this script
// Either modify this script with your actual values or set them as environment variables
const envVars = {
  'SUPABASE_URL': process.env.SUPABASE_URL || 'SET_YOUR_SUPABASE_URL',
  'SUPABASE_KEY': process.env.SUPABASE_KEY || 'SET_YOUR_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY': process.env.SUPABASE_SERVICE_KEY || 'SET_YOUR_SUPABASE_SERVICE_KEY',
  'TWILIO_ACCOUNT_SID': process.env.TWILIO_ACCOUNT_SID || 'SET_YOUR_TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN': process.env.TWILIO_AUTH_TOKEN || 'SET_YOUR_TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER': process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+SET_YOUR_PHONE_NUMBER'
};

// Check if any values are still placeholders
const hasPlaceholders = Object.values(envVars).some(value => value.startsWith('SET_YOUR_'));
if (hasPlaceholders) {
  console.error('❌ Error: Please set your actual environment variable values before running this script.');
  console.error('You can either:');
  console.error('1. Modify this script with your actual values');
  console.error('2. Set environment variables before running: SUPABASE_URL=... SUPABASE_KEY=... npm run setup:vercel-env');
  process.exit(1);
}

// Set each environment variable for all environments
Object.entries(envVars).forEach(([key, value]) => {
  console.log(`Setting ${key}...`);
  
  try {
    // Set for production
    execSync(`vercel env add ${key} production`, { 
      input: `${value}\n`, 
      stdio: ['pipe', 'inherit', 'inherit'] 
    });
    
    // Set for preview
    execSync(`vercel env add ${key} preview`, { 
      input: `${value}\n`, 
      stdio: ['pipe', 'inherit', 'inherit'] 
    });
    
    // Set for development
    execSync(`vercel env add ${key} development`, { 
      input: `${value}\n`, 
      stdio: ['pipe', 'inherit', 'inherit'] 
    });
    
    console.log(`✓ ${key} set for all environments`);
  } catch (error) {
    console.log(`! ${key} may already exist or there was an error`);
  }
});

console.log('\nEnvironment variables setup complete!');
console.log('You can verify them in the Vercel dashboard under Settings → Environment Variables');
console.log('\nTo update a variable, use:');
console.log('vercel env rm <VARIABLE_NAME>');
console.log('vercel env add <VARIABLE_NAME>');
