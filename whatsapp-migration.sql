-- Migration to add WhatsApp Cloud API support
-- Run this SQL in your Supabase SQL editor

-- Add WhatsApp message ID column to message_history table
ALTER TABLE message_history 
ADD COLUMN whatsapp_message_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_message_history_whatsapp_id 
ON message_history(whatsapp_message_id);

-- Add comment for documentation
COMMENT ON COLUMN message_history.whatsapp_message_id 
IS 'WhatsApp Cloud API message ID for tracking message status';
