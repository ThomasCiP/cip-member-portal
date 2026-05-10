-- Run this script in the Supabase SQL Editor to prepare the database for the new Organic Network

-- 1. Profiles Updates
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarded boolean default false,
ADD COLUMN IF NOT EXISTS is_admin boolean default false;

-- 2. Groups Table
CREATE TABLE IF NOT EXISTS groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  visibility text not null default 'public',
  caveat_type text,
  caveat_value text,
  created_by uuid references profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view groups" ON groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert groups" ON groups FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- 3. Group Members Table
CREATE TABLE IF NOT EXISTS group_members (
  group_id uuid references groups(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text default 'member' not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  PRIMARY KEY (group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view group members" ON group_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join groups" ON group_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 4. Network Connections
CREATE TABLE IF NOT EXISTS network_connections (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  status text default 'pending' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE network_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own connections" ON network_connections FOR SELECT TO authenticated USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create connections" ON network_connections FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);

-- 5. Events Table
CREATE TABLE IF NOT EXISTS events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  date text not null,
  type text not null,
  location text not null,
  status text default 'Draft' not null,
  created_by uuid references profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view events" ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert events" ON events FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 6. Event Attendees
CREATE TABLE IF NOT EXISTS event_attendees (
  event_id uuid references events(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  registered_at timestamp with time zone default timezone('utc'::text, now()) not null,
  PRIMARY KEY (event_id, user_id)
);

ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view attendees" ON event_attendees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can register for events" ON event_attendees FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 7. Support Requests
CREATE TABLE IF NOT EXISTS support_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  request_type text not null,
  description text not null,
  urgency text default 'Medium' not null,
  status text default 'Submitted' not null,
  assigned_to uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own requests" ON support_requests FOR SELECT TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Users can insert requests" ON support_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update requests" ON support_requests FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- 8. Messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
