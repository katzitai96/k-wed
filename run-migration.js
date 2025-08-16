const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

async function runMigration() {
  console.log("🔄 Running WhatsApp migration...");

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    // Check if the column already exists
    const { data: columns, error: checkError } = await supabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_name", "message_history")
      .eq("column_name", "whatsapp_message_id");

    if (checkError) {
      console.error("Error checking existing columns:", checkError);
      return;
    }

    if (columns && columns.length > 0) {
      console.log("✅ whatsapp_message_id column already exists");
      return;
    }

    // Add the column using SQL
    const { error } = await supabase.rpc("exec", {
      sql: `
        ALTER TABLE message_history 
        ADD COLUMN whatsapp_message_id TEXT;
        
        CREATE INDEX IF NOT EXISTS idx_message_history_whatsapp_id 
        ON message_history(whatsapp_message_id);
      `,
    });

    if (error) {
      console.error("❌ Migration failed:", error);
      console.log(
        "\n📝 Please run this SQL manually in your Supabase SQL editor:"
      );
      console.log(`
ALTER TABLE message_history 
ADD COLUMN whatsapp_message_id TEXT;

CREATE INDEX IF NOT EXISTS idx_message_history_whatsapp_id 
ON message_history(whatsapp_message_id);
      `);
    } else {
      console.log("✅ Migration completed successfully!");
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    console.log(
      "\n📝 Please run this SQL manually in your Supabase SQL editor:"
    );
    console.log(`
ALTER TABLE message_history 
ADD COLUMN whatsapp_message_id TEXT;

CREATE INDEX IF NOT EXISTS idx_message_history_whatsapp_id 
ON message_history(whatsapp_message_id);
    `);
  }
}

runMigration();
