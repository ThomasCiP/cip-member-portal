-- 9. Resources
CREATE TABLE IF NOT EXISTS resources (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  type text not null,
  category text not null,
  author text not null,
  featured boolean default false,
  url text,
  created_by uuid references profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view resources" ON resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage resources" ON resources FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- 10. Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null,
  cta_text text,
  cta_url text,
  status text default 'Draft' not null,
  created_by uuid references profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published announcements" ON announcements FOR SELECT TO authenticated USING (status = 'Published' OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can manage announcements" ON announcements FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- 11. Affiliated Orgs
CREATE TABLE IF NOT EXISTS affiliated_orgs (
  id uuid default gen_random_uuid() primary key,
  organisation text not null,
  category text not null,
  poc_name text not null,
  poc_type text not null,
  status text default 'Active' not null,
  created_by uuid references profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE affiliated_orgs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active orgs" ON affiliated_orgs FOR SELECT TO authenticated USING (status = 'Active' OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can manage affiliated_orgs" ON affiliated_orgs FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- 12. Data Requests
CREATE TABLE IF NOT EXISTS data_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  request_type text not null,
  status text default 'Pending' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE data_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data requests" ON data_requests FOR SELECT TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Users can insert data requests" ON data_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update data requests" ON data_requests FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
