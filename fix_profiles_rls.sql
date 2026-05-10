-- Run this script in the Supabase SQL Editor to allow users to create their own profile records
-- This fixes the issue where profile data is lost on page refresh because the row doesn't exist

CREATE POLICY "Users can insert own profile" 
ON profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);
