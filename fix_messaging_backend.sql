-- Run this script in the Supabase SQL Editor to fix the backend issues with the Messaging feature

-- 1. Enable Realtime for the messages table so that live chat works
alter publication supabase_realtime add table messages;

-- 2. Add an UPDATE and DELETE policy for network_connections so users can accept or decline requests
CREATE POLICY "Users can update their connections" 
ON network_connections 
FOR UPDATE TO authenticated 
USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can delete their connections" 
ON network_connections 
FOR DELETE TO authenticated 
USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- 3. Add a policy to profiles to allow viewing other members' profiles.
-- Since this is a prototype and you need to be able to connect with people,
-- authenticated users need permission to read the 'profiles' table to see their names.
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view all profiles" 
ON profiles 
FOR SELECT TO authenticated 
USING (true);
