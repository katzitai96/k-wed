const fs = require('fs');
const path = require('path');

console.log('Injecting environment variables into production build...');

// Path to the production environment file
const envProdPath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

// Read the template file
let envContent = fs.readFileSync(envProdPath, 'utf8');

// Define environment variable mappings
const envMappings = {
  'PLACEHOLDER_SUPABASE_URL': process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL',
  'PLACEHOLDER_SUPABASE_KEY': process.env.SUPABASE_KEY || 'YOUR_SUPABASE_ANON_KEY',
  'PLACEHOLDER_SUPABASE_SERVICE_KEY': process.env.SUPABASE_SERVICE_KEY || 'YOUR_SUPABASE_SERVICE_KEY',
  'PLACEHOLDER_TWILIO_ACCOUNT_SID': process.env.TWILIO_ACCOUNT_SID || 'YOUR_TWILIO_ACCOUNT_SID',
  'PLACEHOLDER_TWILIO_AUTH_TOKEN': process.env.TWILIO_AUTH_TOKEN || 'YOUR_TWILIO_AUTH_TOKEN',
  'PLACEHOLDER_TWILIO_PHONE_NUMBER': process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+YOUR_PHONE_NUMBER'
};

// Replace placeholders with actual values
Object.entries(envMappings).forEach(([placeholder, value]) => {
  envContent = envContent.replace(new RegExp(placeholder, 'g'), value);
});

// Write the updated content back to the file
fs.writeFileSync(envProdPath, envContent);

console.log('Environment variables injected successfully!');
console.log('Using values:');
Object.entries(envMappings).forEach(([placeholder, value]) => {
  const displayValue = value.length > 20 ? value.substring(0, 20) + '...' : value;
  console.log(`  ${placeholder.replace('PLACEHOLDER_', '')}: ${displayValue}`);
});
