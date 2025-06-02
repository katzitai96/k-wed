#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Starting Vercel deployment process...\n");

// Check if Vercel CLI is installed
try {
  execSync("vercel --version", { stdio: "pipe" });
  console.log("✅ Vercel CLI is installed");
} catch (error) {
  console.log("❌ Vercel CLI not found. Installing...");
  try {
    execSync("npm install -g vercel", { stdio: "inherit" });
    console.log("✅ Vercel CLI installed successfully");
  } catch (installError) {
    console.error("❌ Failed to install Vercel CLI. Please install manually:");
    console.error("   npm install -g vercel");
    process.exit(1);
  }
}

// Check if user is logged in
try {
  execSync("vercel whoami", { stdio: "pipe" });
  console.log("✅ Logged in to Vercel");
} catch (error) {
  console.log("❌ Not logged in to Vercel. Please run:");
  console.log("   vercel login");
  process.exit(1);
}

// Build the Angular application
console.log("\n📦 Building Angular application...");
try {
  execSync("npm run build:prod", { stdio: "inherit" });
  console.log("✅ Angular build completed");
} catch (error) {
  console.error("❌ Angular build failed");
  process.exit(1);
}

// Check if dist folder exists
const distPath = path.join(__dirname, "dist", "wedding-rsvp");
if (!fs.existsSync(distPath)) {
  console.error("❌ Dist folder not found. Build may have failed.");
  process.exit(1);
}

// Deploy to Vercel
console.log("\n🌐 Deploying to Vercel...");
try {
  const deployOutput = execSync("vercel --prod", { encoding: "utf8" });
  console.log("✅ Deployment successful!");
  console.log("\nDeployment URL:", deployOutput.trim());

  // Extract the deployment URL for webhook setup
  const urlMatch = deployOutput.match(/https:\/\/[^\s]+/);
  if (urlMatch) {
    const deploymentUrl = urlMatch[0];
    console.log("\n📋 Next steps:");
    console.log("1. Set environment variables in Vercel dashboard");
    console.log("2. Update Twilio webhook URL to:");
    console.log(`   ${deploymentUrl}/api/webhook-response`);
    console.log("3. Test the deployment with:");
    console.log(`   curl ${deploymentUrl}/api/health`);
  }
} catch (error) {
  console.error("❌ Deployment failed");
  console.error(error.message);
  process.exit(1);
}

console.log("\n🎉 Deployment process completed!");
console.log("\n💡 Tips:");
console.log("- Check function logs in Vercel dashboard if issues occur");
console.log("- Test each API endpoint after deployment");
console.log("- Update your Angular app to use the new API URLs");
