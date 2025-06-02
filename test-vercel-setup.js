const fs = require('fs');
const path = require('path');

// Test function to verify serverless function structure
async function testServerlessFunctions() {
  console.log('🧪 Testing serverless function setup...\n');

  const apiDir = path.join(__dirname, 'api');
  
  if (!fs.existsSync(apiDir)) {
    console.error('❌ API directory not found!');
    return false;
  }

  const requiredFiles = [
    'health.js',
    'send-message.js',
    'send-bulk-messages.js',
    'schedule-message.js',
    'webhook-response.js',
    '_utils.js'
  ];

  console.log('📁 Checking required API files:');
  let allFilesExist = true;

  for (const file of requiredFiles) {
    const filePath = path.join(apiDir, file);
    const exists = fs.existsSync(filePath);
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
  }

  console.log('\n📋 Checking vercel.json configuration:');
  const vercelConfigPath = path.join(__dirname, 'vercel.json');
  const vercelConfigExists = fs.existsSync(vercelConfigPath);
  console.log(`   ${vercelConfigExists ? '✅' : '❌'} vercel.json exists`);

  if (vercelConfigExists) {
    try {
      const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
      const hasBuilds = vercelConfig.builds && vercelConfig.builds.length > 0;
      const hasRoutes = vercelConfig.routes && vercelConfig.routes.length > 0;
      console.log(`   ${hasBuilds ? '✅' : '❌'} Has build configuration`);
      console.log(`   ${hasRoutes ? '✅' : '❌'} Has route configuration`);
    } catch (error) {
      console.log('   ❌ Invalid JSON in vercel.json');
      allFilesExist = false;
    }
  } else {
    allFilesExist = false;
  }

  console.log('\n📦 Checking package.json build script:');
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const hasVercelBuild = packageJson.scripts && packageJson.scripts['vercel-build'];
    console.log(`   ${hasVercelBuild ? '✅' : '❌'} Has vercel-build script`);
    if (!hasVercelBuild) allFilesExist = false;
  }

  console.log('\n' + '='.repeat(50));
  
  if (allFilesExist) {
    console.log('🎉 All serverless function requirements are met!');
    console.log('\n📚 Next steps:');
    console.log('1. Run: vercel');
    console.log('2. Set environment variables in Vercel dashboard');
    console.log('3. Update Twilio webhook URL');
    console.log('4. Deploy: vercel --prod');
  } else {
    console.log('❌ Some requirements are missing. Please fix the issues above.');
  }

  return allFilesExist;
}

// Run the test
testServerlessFunctions().catch(console.error);
