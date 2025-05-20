#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const readline = require("readline");

// Load environment variables
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function promptForCredentials() {
  let supabaseUrl = process.env.SUPABASE_URL;
  let supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || supabaseUrl === "YOUR_SUPABASE_URL") {
    supabaseUrl = await new Promise((resolve) => {
      rl.question("Enter your Supabase URL: ", resolve);
    });
  }

  if (!supabaseKey || supabaseKey === "YOUR_SUPABASE_KEY") {
    supabaseKey = await new Promise((resolve) => {
      rl.question(
        "Enter your Supabase service role key (from API settings): ",
        resolve
      );
    });
  }

  return { supabaseUrl, supabaseKey };
}

async function setupDatabase() {
  try {
    console.log("🚀 Setting up the Wedding RSVP database in Supabase...");

    // Get credentials
    const { supabaseUrl, supabaseKey } = await promptForCredentials();

    // Initialize Supabase client with service role key (needed for SQL execution)
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Read the SQL file
    const sqlPath = path.join(__dirname, "supabase-schema.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log("📝 Executing SQL schema creation...");

    // Execute SQL statements
    const { error } = await supabase.rpc("pgexecute", { query: sql });

    if (error) {
      console.error("❌ Error setting up database:", error.message);
      console.log("");
      console.log(
        "You may need to manually execute the SQL commands from supabase-schema.sql"
      );
      console.log(
        "in the Supabase SQL editor. Check if your service role key has the"
      );
      console.log("necessary permissions.");
      process.exit(1);
    }

    console.log("✅ Database setup completed successfully!");
    console.log("");
    console.log("Next steps:");
    console.log("1. Update your environment variables in:");
    console.log("   - src/environments/environment.ts");
    console.log("   - src/environments/environment.prod.ts");
    console.log("   - .env file");
    console.log("2. Configure your Twilio WhatsApp sandbox");
    console.log("3. Run the application with:");
    console.log("   ng serve");
    console.log("   node src/app/server/server.js");

    rl.close();
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    rl.close();
    process.exit(1);
  }
}

setupDatabase();
