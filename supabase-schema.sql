-- Supabase SQL schema for wedding RSVP application

-- Create enums
CREATE TYPE relation_type AS ENUM ('family', 'friend', 'colleague', 'other');
CREATE TYPE rsvp_status AS ENUM ('pending', 'confirmed', 'declined', 'maybe');
CREATE TYPE message_type AS ENUM ('invitation', 'reminder', 'confirmation', 'location', 'custom');
CREATE TYPE message_status AS ENUM ('delivered', 'failed', 'pending');

-- Create invitees table
CREATE TABLE invitees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  number_of_guests INTEGER NOT NULL DEFAULT 1,
  relation relation_type NOT NULL,
  rsvp_status rsvp_status NOT NULL DEFAULT 'pending',
  dietary_restrictions TEXT,
  special_requests TEXT,
  last_contacted TIMESTAMP WITH TIME ZONE,
  additional_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message templates table
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  type message_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message history table
CREATE TABLE message_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitee_id UUID REFERENCES invitees(id),
  template_id UUID REFERENCES message_templates(id),
  message_body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status message_status NOT NULL DEFAULT 'pending',
  response_received BOOLEAN DEFAULT FALSE,
  response_text TEXT,
  response_received_at TIMESTAMP WITH TIME ZONE
);

-- Insert default message templates
INSERT INTO message_templates (name, subject, body, type) VALUES 
(
  'Wedding Invitation', 
  'Wedding Invitation', 
  'Dear {{firstName}} {{lastName}},\n\nWe are delighted to invite you to our wedding celebration. Please RSVP by replying to this message with "Yes" or "No" followed by the number of guests.\n\nWe look forward to your response!\n\nBest wishes,\n[Couple Names]', 
  'invitation'
),
(
  'RSVP Confirmation', 
  'RSVP Confirmation', 
  'Dear {{firstName}},\n\nThank you for your RSVP! We have confirmed your attendance with {{numberOfGuests}} guests.\n\nWe look forward to celebrating with you!\n\nBest wishes,\n[Couple Names]', 
  'confirmation'
),
(
  'Location Details', 
  'Wedding Location', 
  'Dear {{firstName}},\n\nHere are the details for our wedding:\n\nDate: [Wedding Date]\nTime: [Wedding Time]\nVenue: [Venue Name]\nAddress: [Venue Address]\n\nWe look forward to celebrating with you!\n\nBest wishes,\n[Couple Names]', 
  'location'
),
(
  'RSVP Reminder', 
  'Wedding RSVP Reminder', 
  'Dear {{firstName}},\n\nThis is a friendly reminder to RSVP for our wedding. Please reply to this message with "Yes" or "No" followed by the number of guests.\n\nBest wishes,\n[Couple Names]', 
  'reminder'
);

-- Create RLS policies
ALTER TABLE invitees ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_history ENABLE ROW LEVEL SECURITY;

-- Create access policies (assuming you'll have authenticated users)
CREATE POLICY "Allow full access to authenticated users" ON invitees FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow full access to authenticated users" ON message_templates FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow full access to authenticated users" ON message_history FOR ALL TO authenticated USING (true);
