-- Run this script in your Supabase SQL Editor to fully resolve the messaging permissions
-- It ensures that you have the correct INSERT, UPDATE, and DELETE policies so the app doesn't fail silently

-- 1. Policies for `network_connections` table
DROP POLICY IF EXISTS "Users can create connections" ON network_connections;
CREATE POLICY "Users can create connections" 
ON network_connections 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Users can update their connections" ON network_connections;
CREATE POLICY "Users can update their connections" 
ON network_connections 
FOR UPDATE TO authenticated 
USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can delete their connections" ON network_connections;
CREATE POLICY "Users can delete their connections" 
ON network_connections 
FOR DELETE TO authenticated 
USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can view their own connections" ON network_connections;
CREATE POLICY "Users can view their own connections" 
ON network_connections 
FOR SELECT TO authenticated 
USING (auth.uid() = requester_id OR auth.uid() = receiver_id);


-- 2. Policies for `messages` table
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" 
ON messages 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages" 
ON messages 
FOR SELECT TO authenticated 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);


-- 3. Ensure realtime is enabled so chat updates instantly without refreshing
alter publication supabase_realtime add table messages;
