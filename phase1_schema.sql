-- Run this script in the Supabase SQL Editor to prepare the database for Phase 1

-- 1. Expand the profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS job_title text,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS federal_electorate text,
ADD COLUMN IF NOT EXISTS state_electorate text,
ADD COLUMN IF NOT EXISTS party text,
ADD COLUMN IF NOT EXISTS tradition text,
ADD COLUMN IF NOT EXISTS show_party boolean default false,
ADD COLUMN IF NOT EXISTS role text default 'member';

-- 2. Create the feed_items table
CREATE TABLE IF NOT EXISTS feed_items (
  id uuid default gen_random_uuid() primary key,
  type text not null,
  title text not null,
  body text not null,
  cta_text text,
  cta_link text,
  image boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Row Level Security (RLS) for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid errors
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Members can only view and edit their own profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Admins can view and edit all profiles
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Row Level Security (RLS) for Feed Items
ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view feed items" ON feed_items;
DROP POLICY IF EXISTS "Admins can insert feed items" ON feed_items;
DROP POLICY IF EXISTS "Admins can update feed items" ON feed_items;
DROP POLICY IF EXISTS "Admins can delete feed items" ON feed_items;

-- All authenticated users can view feed items
CREATE POLICY "Anyone can view feed items" ON feed_items FOR SELECT TO authenticated USING (true);

-- Only admins can modify feed items
CREATE POLICY "Admins can insert feed items" ON feed_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update feed items" ON feed_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete feed items" ON feed_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Seed initial mock data into feed_items
INSERT INTO feed_items (type, title, body, cta_text, image, created_at) VALUES
('Announcement', 'Liberal pre-selection nominations open in QLD', 'Nominations close 14 June. CiP can connect interested members with current branch members for a private conversation before you decide.', 'Express interest', false, now() - interval '2 days'),
('Event', 'Faithful Politics: An evening with Tim Costello', 'A wide-ranging conversation about discipleship in public life. Q&A included. Wed 27 May · 7:00 PM AEST · Online.', 'Register', true, now() - interval '3 days'),
('Reflection', 'On disagreeing well: a short reflection from our chair', 'Public life is increasingly polarised. How do we hold convictions while loving those who hold different ones? A 4-minute read.', 'Read more', false, now() - interval '5 days'),
('Resource', 'New: Branch meetings — an inside look', 'What to expect at your first branch meeting, how to prepare, and how to make the most of it. 8-min video.', 'View resource', false, now() - interval '1 week'),
('Support', 'Considering standing for council? Talk to us first.', 'Local government is a meaningful entry point. Our team can walk you through what''s involved and connect you with someone who''s done it.', 'Request support', false, now() - interval '1 week'),
('Opportunity', 'Summer policy internship — Federal Senator''s office', 'Six-week policy internship for current students. Christian applicants encouraged to apply.', 'Read more', false, now() - interval '1 week'),
('Donate', 'Help us reach more young Christians considering public service', 'Your support funds the mentoring conversations, training events and pastoral care that quietly shape Australia''s next generation of public servants.', 'Donate', false, now() - interval '2 weeks');
