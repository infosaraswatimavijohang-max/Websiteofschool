-- ====================================================================
-- SECTION 1: RUN THESE STATEMENTS ON THE PRIMARY DATABASE (DB 1)
-- URL: https://ohczlooperjqpyllmabo.supabase.co
-- ====================================================================

-- 1. Students Registry
create table if not exists public.students_registry (
  roll integer primary key,
  name text not null,
  class text not null,
  attendance text not null default '100.0%',
  overall_gpa text default '0.00',
  status text not null default 'Active',
  billing_state text not null default 'unpaid',
  billing_rejection_remark text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.5. Student Login Credentials (for Student Portal Access)
create table if not exists public.student_credentials (
  id bigint generated always as identity primary key,
  student_roll integer unique not null,
  student_name text not null,
  student_username text unique not null,
  student_password text not null, -- Store as bcrypt hash in production
  student_email text,
  student_phone text,
  student_class text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  foreign key (student_roll) references public.students_registry(roll) on delete cascade
);

-- 2. Teachers Registry
create table if not exists public.teachers_registry (
  code text primary key,
  name text not null,
  subject text not null,
  sections text not null,
  status text not null default 'Active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.5. Teacher Profiles (Dynamic Teacher Information for Display)
create table if not exists public.teacher_profiles (
  id bigint generated always as identity primary key,
  teacher_code text unique,
  teacher_name text not null,
  teacher_role text not null,
  teacher_title text,
  teacher_description text,
  teacher_image_url text,
  teacher_email text,
  teacher_phone text,
  teacher_qualifications text,
  teacher_experience text,
  teacher_expertise text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2.6. Classes and Sections Management
create table if not exists public.classes (
  id bigint generated always as identity primary key,
  grade_level text not null,
  section_name text not null,
  class_teacher text,
  class_teacher_code text,
  total_strength integer default 0,
  status text not null default 'Active',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(grade_level, section_name)
);

-- Index for faster class queries
create index if not exists idx_classes_grade_level on public.classes(grade_level);
create index if not exists idx_classes_status on public.classes(status);
create index if not exists idx_classes_teacher on public.classes(class_teacher_code);

-- 3. Fee Payments
create table if not exists public.fee_payments (
  id bigint generated always as identity primary key,
  name text not null,
  roll integer not null,
  category text not null,
  txn_id text unique not null,
  proof_file text not null,
  status text not null default 'pending',
  submitted_time text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Student Leaves
create table if not exists public.student_leaves (
  id bigint generated always as identity primary key,
  name text not null,
  type text not null,
  range text not null,
  "desc" text not null,
  proof_file text,
  emoji text default '🌴',
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. School Timetables
create table if not exists public.school_timetables (
  id bigint generated always as identity primary key,
  time text not null,
  subject text not null,
  details text not null,
  section text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. School Announcements
create table if not exists public.school_announcements (
  id bigint generated always as identity primary key,
  date text not null,
  title text not null,
  category text not null,
  "desc" text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. School Events
create table if not exists public.school_events (
  id bigint generated always as identity primary key,
  date text not null,
  time text not null,
  title text not null,
  location text not null,
  "desc" text not null,
  published boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Submitted Results (by Teachers)
create table if not exists public.submitted_results (
  id bigint generated always as identity primary key,
  subject text not null,
  class text not null,
  exam_type text not null,
  total_marks integer not null,
  students jsonb not null, -- Array of student results
  submission_date text not null,
  status text not null default 'Pending',
  timestamp bigint not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Approved Results (visible to Students)
create table if not exists public.approved_results (
  id bigint generated always as identity primary key,
  subject text not null,
  class text not null,
  exam_type text not null,
  marks integer not null,
  total_marks integer not null,
  grade text not null,
  gpa numeric not null,
  percentage numeric not null,
  date text not null,
  student_roll integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Admission Enquiries (from home page)
create table if not exists public.admission_enquiries (
  id bigint generated always as identity primary key,
  full_name text not null,
  apply_class text not null,
  phone text not null,
  status text not null default 'Pending Followup',
  student_photo text,
  birth_cert text,
  ble_cert text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Generic Modules Data
create table if not exists public.generic_modules_data (
  id bigint generated always as identity primary key,
  module_key text not null,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. School Configurations (for calendar state/publishings)
create table if not exists public.school_config (
  key text primary key,
  val jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS and create public-access policies for all tables in DB 1
alter table public.students_registry enable row level security;
drop policy if exists "Allow all public access" on public.students_registry;
create policy "Allow all public access" on public.students_registry for all using (true) with check (true);

alter table public.student_credentials enable row level security;
drop policy if exists "Allow all public access" on public.student_credentials;
create policy "Allow all public access" on public.student_credentials for all using (true) with check (true);

alter table public.teachers_registry enable row level security;
drop policy if exists "Allow all public access" on public.teachers_registry;
create policy "Allow all public access" on public.teachers_registry for all using (true) with check (true);

alter table public.teacher_profiles enable row level security;
drop policy if exists "Allow all public access" on public.teacher_profiles;
create policy "Allow all public access" on public.teacher_profiles for all using (true) with check (true);

alter table public.classes enable row level security;
drop policy if exists "Allow all public access" on public.classes;
create policy "Allow all public access" on public.classes for all using (true) with check (true);

alter table public.fee_payments enable row level security;
drop policy if exists "Allow all public access" on public.fee_payments;
create policy "Allow all public access" on public.fee_payments for all using (true) with check (true);

alter table public.student_leaves enable row level security;
drop policy if exists "Allow all public access" on public.student_leaves;
create policy "Allow all public access" on public.student_leaves for all using (true) with check (true);

alter table public.school_timetables enable row level security;
drop policy if exists "Allow all public access" on public.school_timetables;
create policy "Allow all public access" on public.school_timetables for all using (true) with check (true);

alter table public.school_announcements enable row level security;
drop policy if exists "Allow all public access" on public.school_announcements;
create policy "Allow all public access" on public.school_announcements for all using (true) with check (true);

alter table public.school_events enable row level security;
drop policy if exists "Allow all public access" on public.school_events;
create policy "Allow all public access" on public.school_events for all using (true) with check (true);

alter table public.submitted_results enable row level security;
drop policy if exists "Allow all public access" on public.submitted_results;
create policy "Allow all public access" on public.submitted_results for all using (true) with check (true);

alter table public.approved_results enable row level security;
drop policy if exists "Allow all public access" on public.approved_results;
create policy "Allow all public access" on public.approved_results for all using (true) with check (true);

alter table public.admission_enquiries enable row level security;
drop policy if exists "Allow all public access" on public.admission_enquiries;
create policy "Allow all public access" on public.admission_enquiries for all using (true) with check (true);

alter table public.generic_modules_data enable row level security;
drop policy if exists "Allow all public access" on public.generic_modules_data;
create policy "Allow all public access" on public.generic_modules_data for all using (true) with check (true);

alter table public.school_config enable row level security;
drop policy if exists "Allow all public access" on public.school_config;
create policy "Allow all public access" on public.school_config for all using (true) with check (true);

-- 12.5 Admission Documents Storage Bucket Setup
insert into storage.buckets (id, name, public)
values ('admission-documents', 'admission-documents', true)
on conflict (id) do nothing;

drop policy if exists "Allow public read admission docs" on storage.objects;
create policy "Allow public read admission docs" on storage.objects for select using (bucket_id = 'admission-documents');
drop policy if exists "Allow public insert admission docs" on storage.objects;
create policy "Allow public insert admission docs" on storage.objects for insert with check (bucket_id = 'admission-documents');
drop policy if exists "Allow public delete admission docs" on storage.objects;
create policy "Allow public delete admission docs" on storage.objects for delete using (bucket_id = 'admission-documents');

-- 13. School Clubs & Activities (Co-Curricular)
create table if not exists public.school_clubs (
  id bigint generated always as identity primary key,
  title text not null,
  category text not null,
  description text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.school_clubs enable row level security;
drop policy if exists "Allow all public access" on public.school_clubs;
create policy "Allow all public access" on public.school_clubs for all using (true) with check (true);

-- 14. School Achievements & Laurels
create table if not exists public.school_achievements (
  id bigint generated always as identity primary key,
  title text not null,
  description text not null,
  icon_emoji text,
  category text,
  year text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.school_achievements enable row level security;
drop policy if exists "Allow all public access" on public.school_achievements;
create policy "Allow all public access" on public.school_achievements for all using (true) with check (true);

-- 15. Alumni Profiles
create table if not exists public.alumni_profiles (
  id bigint generated always as identity primary key,
  alumni_name text not null,
  position text not null,
  company text not null,
  alumni_photo_url text,
  testimonial text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.alumni_profiles enable row level security;
drop policy if exists "Allow all public access" on public.alumni_profiles;
create policy "Allow all public access" on public.alumni_profiles for all using (true) with check (true);

-- 16. School Documents & Guidelines
create table if not exists public.school_documents (
  id bigint generated always as identity primary key,
  title text not null,
  description text not null,
  file_url text not null,
  category text not null, -- e.g., 'Syllabus', 'Admission', 'Calendar', 'Guidelines'
  icon_type text default 'document', -- Used for UI icon rendering
  display_order integer default 0,
  is_active boolean default true,
  uploaded_by text default 'Admin',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.school_documents enable row level security;
drop policy if exists "Allow all public access" on public.school_documents;
create policy "Allow all public access" on public.school_documents for all using (true) with check (true);

-- 17. School Notices & Announcements (Dynamic)
create table if not exists public.school_notices (
  id bigint generated always as identity primary key,
  date text not null,
  title text not null,
  description text not null,
  icon_emoji text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.school_notices enable row level security;
drop policy if exists "Allow all public access" on public.school_notices;
create policy "Allow all public access" on public.school_notices for all using (true) with check (true);

-- 18. Teacher Login Credentials (for Teacher Portal Access)
create table if not exists public.teacher_credentials (
  id bigint generated always as identity primary key,
  teacher_code text unique not null,
  teacher_name text not null,
  teacher_email text unique not null,
  teacher_password text not null, -- Plain text for ease of prototype sync, hash recommended in production
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  foreign key (teacher_code) references public.teachers_registry(code) on delete cascade
);

alter table public.teacher_credentials enable row level security;
drop policy if exists "Allow all public access" on public.teacher_credentials;
create policy "Allow all public access" on public.teacher_credentials for all using (true) with check (true);

-- ====================================================================
-- ABOUT PAGE DYNAMIC CONTENT TABLES
-- URL: https://ohczlooperjqpyllmabo.supabase.co
-- ====================================================================

-- 18.5. About Page Hero Banner
create table if not exists public.about_hero (
  id bigint generated always as identity primary key,
  hero_title text not null,
  hero_subtitle text,
  hero_background_image text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.about_hero enable row level security;
drop policy if exists "Allow all public access" on public.about_hero;
create policy "Allow all public access" on public.about_hero for all using (true) with check (true);

-- Insert default hero banner if not exists
insert into public.about_hero (hero_title, hero_subtitle, hero_background_image, display_order)
values ('About Our School', 'Honoring the visionary headmasters who have steered Shree Saraswati Secondary School since its inception in 2016 B.S.', '../images/img.jpg', 0)
on conflict do nothing;

-- 19. About Page Statistics (Badges with numbers)
create table if not exists public.about_stats (
  id bigint generated always as identity primary key,
  icon_emoji text not null,
  stat_number text not null,
  stat_label text not null,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.about_stats enable row level security;
drop policy if exists "Allow all public access" on public.about_stats;
create policy "Allow all public access" on public.about_stats for all using (true) with check (true);

-- 20. About Page Vision & Mission
create table if not exists public.about_vision_mission (
  id bigint generated always as identity primary key,
  section_type text not null, -- 'vision' or 'mission'
  icon_emoji text not null,
  section_title text not null,
  section_description text not null,
  key_points jsonb not null, -- Array of key points
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.about_vision_mission enable row level security;
drop policy if exists "Allow all public access" on public.about_vision_mission;
create policy "Allow all public access" on public.about_vision_mission for all using (true) with check (true);

-- 21. About Page Historical Era Cards
create table if not exists public.about_era_cards (
  id bigint generated always as identity primary key,
  icon_emoji text not null,
  era_badge text not null,
  era_title text not null,
  era_description text not null,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.about_era_cards enable row level security;
drop policy if exists "Allow all public access" on public.about_era_cards;
create policy "Allow all public access" on public.about_era_cards for all using (true) with check (true);

-- 22. About Page Historical Timeline
create table if not exists public.about_timeline (
  id bigint generated always as identity primary key,
  icon_emoji text not null,
  timeline_date text not null,
  timeline_title text not null,
  timeline_description text not null,
  timeline_position text not null, -- 'left' or 'right'
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.about_timeline enable row level security;
drop policy if exists "Allow all public access" on public.about_timeline;
create policy "Allow all public access" on public.about_timeline for all using (true) with check (true);

-- 23. About Page Admin Team Members
create table if not exists public.about_admin_team (
  id bigint generated always as identity primary key,
  member_name text not null,
  member_role text not null,
  member_department text not null,
  member_photo_url text,
  member_email text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.about_admin_team enable row level security;
drop policy if exists "Allow all public access" on public.about_admin_team;
create policy "Allow all public access" on public.about_admin_team for all using (true) with check (true);

-- 24. About Page Principals Succession Tree
create table if not exists public.about_principals_tree (
  id bigint generated always as identity primary key,
  principal_name text not null,
  principal_tenure_start text not null,
  principal_tenure_end text not null,
  principal_description text not null,
  principal_photo_url text,
  tree_position text not null, -- 'left' or 'right'
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.about_principals_tree enable row level security;
drop policy if exists "Allow all public access" on public.about_principals_tree;
create policy "Allow all public access" on public.about_principals_tree for all using (true) with check (true);

-- 25. About Page Technical Incharge Succession Tree
create table if not exists public.about_technical_incharge_tree (
  id bigint generated always as identity primary key,
  incharge_name text not null,
  incharge_tenure_start text not null,
  incharge_tenure_end text not null,
  incharge_description text not null,
  incharge_photo_url text,
  tree_position text not null, -- 'left' or 'right'
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.about_technical_incharge_tree enable row level security;
drop policy if exists "Allow all public access" on public.about_technical_incharge_tree;
create policy "Allow all public access" on public.about_technical_incharge_tree for all using (true) with check (true);

-- 26. About Page Primary Incharge Succession Tree
create table if not exists public.about_primary_incharge_tree (
  id bigint generated always as identity primary key,
  incharge_name text not null,
  incharge_tenure_start text not null,
  incharge_tenure_end text not null,
  incharge_description text not null,
  incharge_photo_url text,
  tree_position text not null, -- 'left' or 'right'
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.about_primary_incharge_tree enable row level security;
drop policy if exists "Allow all public access" on public.about_primary_incharge_tree;
create policy "Allow all public access" on public.about_primary_incharge_tree for all using (true) with check (true);

-- ====================================================================
-- SECTION 2: RUN THESE STATEMENTS ON THE MEDIA DATABASE (DB 2)
-- URL: https://xowlownqmnfffhnkxdpw.supabase.co
-- ====================================================================

-- Create pictures table for base64 fallback uploads
create table if not exists public.pictures (
  id bigint generated always as identity primary key,
  path text unique not null,
  data text not null, -- Base64-encoded image string
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.pictures enable row level security;
drop policy if exists "Allow all public access" on public.pictures;
create policy "Allow all public access" on public.pictures for all using (true) with check (true);

-- Gallery Table (for dynamic gallery management)
create table if not exists public.gallery (
  id bigint generated always as identity primary key,
  album_name text not null,
  image_url text not null,
  image_caption text,
  storage_path text, -- Path in Supabase storage bucket
  uploaded_by text,
  display_order integer default 0,
  gallery_category text default 'General', -- General, Events, Sports, Academic, etc.
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.gallery enable row level security;
drop policy if exists "Allow all public access" on public.gallery;
create policy "Allow all public access" on public.gallery for all using (true) with check (true);

-- ====================================================================
-- setup Storage Bucket: run this if SQL access to storage schema is permitted
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "Allow public read" on storage.objects;
create policy "Allow public read" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "Allow public insert" on storage.objects;
create policy "Allow public insert" on storage.objects for insert with check (bucket_id = 'media');
drop policy if exists "Allow public delete" on storage.objects;
create policy "Allow public delete" on storage.objects for delete using (bucket_id = 'media');

-- ====================================================================
-- SECTION 3: TEACHER PROFILES CRUD OPERATIONS
-- URL: https://ohczlooperjqpyllmabo.supabase.co
-- ====================================================================

-- C: CREATE - Add a new teacher profile
-- INSERT INTO public.teacher_profiles (teacher_code, teacher_name, teacher_role, teacher_title, teacher_description, teacher_image_url, teacher_email, teacher_phone, teacher_qualifications, teacher_experience, teacher_expertise, display_order, is_active)
-- VALUES ('TEACH001', 'John Doe', 'Senior Teacher', 'Head of Department', 'Leading the mathematics department...', 'https://image-url.jpg', 'john@school.com', '+977-98xxxxxxxx', 'M.Sc Mathematics, B.Ed', '15 years', 'Advanced Mathematics, Curriculum Design', 1, true);

-- R: READ - Get all active teacher profiles ordered by display_order
-- SELECT * FROM public.teacher_profiles WHERE is_active = true ORDER BY display_order ASC;

-- R: READ - Get a specific teacher profile by ID
-- SELECT * FROM public.teacher_profiles WHERE id = 1;

-- R: READ - Get all teacher profiles (including inactive)
-- SELECT * FROM public.teacher_profiles ORDER BY display_order ASC;

-- U: UPDATE - Update teacher profile details
-- UPDATE public.teacher_profiles 
-- SET teacher_name = 'Jane Doe', 
--     teacher_title = 'Computer Science Head',
--     teacher_description = 'Passionate about technology education...',
--     updated_at = now()
-- WHERE id = 1;

-- U: UPDATE - Activate or deactivate a teacher profile
-- UPDATE public.teacher_profiles SET is_active = false, updated_at = now() WHERE id = 1;

-- D: DELETE - Remove a teacher profile
-- DELETE FROM public.teacher_profiles WHERE id = 1;

-- D: DELETE - Remove all teacher profiles (use with caution)
-- DELETE FROM public.teacher_profiles;

-- ====================================================================
-- SECTION 4: SCHOOL ACHIEVEMENTS CRUD OPERATIONS
-- URL: https://ohczlooperjqpyllmabo.supabase.co
-- ====================================================================

-- C: CREATE - Add a new school achievement
-- INSERT INTO public.school_achievements (title, description, icon_emoji, category, year, display_order, is_active)
-- VALUES ('98% SEE Pass Distinction', 'Awarded by the Satyawati Municipality for delivering the highest distinction percentage in public schooling in 2080 B.S.', '🏆', 'Examination', '2080', 1, true);

-- R: READ - Get all active achievements ordered by display_order
-- SELECT * FROM public.school_achievements WHERE is_active = true ORDER BY display_order ASC;

-- R: READ - Get a specific achievement by ID
-- SELECT * FROM public.school_achievements WHERE id = 1;

-- U: UPDATE - Update achievement details
-- UPDATE public.school_achievements 
-- SET title = 'Best Technical School', description = 'Honored at the Provincial ICT Summit...', updated_at = now()
-- WHERE id = 1;

-- D: DELETE - Remove an achievement
-- DELETE FROM public.school_achievements WHERE id = 1;

-- ====================================================================
-- SECTION 5: ALUMNI PROFILES CRUD OPERATIONS
-- URL: https://ohczlooperjqpyllmabo.supabase.co
-- ====================================================================

-- C: CREATE - Add a new alumni profile
-- INSERT INTO public.alumni_profiles (alumni_name, position, company, alumni_photo_url, testimonial, display_order, is_active)
-- VALUES ('Eng. Kiran Panthi', 'Software Engineer', 'F1Soft', 'https://image-url.jpg', 'The foundational computer engineering classes at Bedauri gave me the coding confidence...', 1, true);

-- R: READ - Get all active alumni ordered by display_order
-- SELECT * FROM public.alumni_profiles WHERE is_active = true ORDER BY display_order ASC;

-- R: READ - Get a specific alumni profile by ID
-- SELECT * FROM public.alumni_profiles WHERE id = 1;

-- U: UPDATE - Update alumni profile details
-- UPDATE public.alumni_profiles 
-- SET position = 'Senior Software Engineer', company = 'Tech Corp', updated_at = now()
-- WHERE id = 1;

-- D: DELETE - Remove an alumni profile
-- DELETE FROM public.alumni_profiles WHERE id = 1;

-- ====================================================================
-- SECTION 6: STUDENT LOGIN CREDENTIALS CRUD OPERATIONS
-- URL: https://ohczlooperjqpyllmabo.supabase.co
-- ====================================================================

-- C: CREATE - Add a new student login credential
-- INSERT INTO public.student_credentials (student_roll, student_name, student_username, student_password, student_email, student_phone, student_class, is_active)
-- VALUES (1, 'Ramesh Adhikari', 'ramesh_001', 'hashed_password_here', 'ramesh@school.com', '+977-98xxxxxxxx', 'Grade 10 - A', true);

-- R: READ - Get all active students with login credentials
-- SELECT id, student_roll, student_name, student_username, student_email, student_class, is_active FROM public.student_credentials WHERE is_active = true ORDER BY student_roll ASC;

-- R: READ - Get a specific student credential by username (for login)
-- SELECT id, student_roll, student_name, student_username, student_password, student_email, student_class FROM public.student_credentials WHERE student_username = 'ramesh_001' AND is_active = true;

-- R: READ - Get a specific student by roll number
-- SELECT * FROM public.student_credentials WHERE student_roll = 1;

-- U: UPDATE - Change student password
-- UPDATE public.student_credentials SET student_password = 'new_hashed_password', updated_at = now() WHERE student_roll = 1;

-- U: UPDATE - Activate or deactivate a student account
-- UPDATE public.student_credentials SET is_active = false, updated_at = now() WHERE student_roll = 1;

-- U: UPDATE - Update student details
-- UPDATE public.student_credentials SET student_email = 'newemail@school.com', student_phone = '+977-98xxxxxxxx', updated_at = now() WHERE student_roll = 1;

-- D: DELETE - Remove a student credential (student remains in registry)
-- DELETE FROM public.student_credentials WHERE student_roll = 1;

-- ====================================================================
-- SECTION 7: TEACHER LOGIN CREDENTIALS CRUD OPERATIONS
-- URL: https://ohczlooperjqpyllmabo.supabase.co
-- ====================================================================

-- C: CREATE - Add a new teacher login credential
-- INSERT INTO public.teacher_credentials (teacher_code, teacher_name, teacher_email, teacher_password, is_active)
-- VALUES ('TCH-2080-04', 'Prof. Ramesh Bhandari', 'ramesh@school.com', 'saraswati123', true);

-- R: READ - Get all active teacher credentials
-- SELECT * FROM public.teacher_credentials WHERE is_active = true ORDER BY teacher_code ASC;

-- R: READ - Get a specific teacher credential by email (for login)
-- SELECT * FROM public.teacher_credentials WHERE teacher_email = 'ramesh@school.com' AND is_active = true;

-- U: UPDATE - Change teacher password
-- UPDATE public.teacher_credentials SET teacher_password = 'new_password', updated_at = now() WHERE teacher_code = 'TCH-2080-04';

-- U: UPDATE - Activate/deactivate teacher account
-- UPDATE public.teacher_credentials SET is_active = false, updated_at = now() WHERE teacher_code = 'TCH-2080-04';

-- D: DELETE - Remove a teacher credential
-- DELETE FROM public.teacher_credentials WHERE teacher_code = 'TCH-2080-04';

-- ====================================================================
-- SECTION 8: ACADEMIC CATEGORIES & REMARKS
-- ====================================================================

-- 19. Academic Categories
create table if not exists public.academic_categories (
  id bigint generated always as identity primary key,
  category_type text not null, -- e.g. 'Fee', 'Exam', 'Designation'
  category_name text not null,
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.academic_categories enable row level security;
drop policy if exists "Allow all public access" on public.academic_categories;
create policy "Allow all public access" on public.academic_categories for all using (true) with check (true);

-- 12.3 Student Remarks System
create table if not exists public.student_remarks (
  id serial primary key,
  student_roll integer not null,
  remark_text text not null,
  remark_type text not null default 'Neutral', -- Positive, Neutral, Warning
  given_by text,
  given_date date,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 12.4 Student Certificates (TC, CC, Extra)
create table if not exists public.student_certificates (
  id serial primary key,
  student_roll integer,
  student_name text not null,
  certificate_type text not null, -- 'TC', 'CC', 'Both TC and CC', or custom extra types
  issue_date date,
  status text default 'Issued', -- 'Issued', 'Pending Approval', 'Cancelled'
  file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 12.5 Admission Documents Storage Bucket Setup
alter table public.student_remarks enable row level security;
drop policy if exists "Allow all public access" on public.student_remarks;
create policy "Allow all public access" on public.student_remarks for all using (true) with check (true);

alter table public.student_certificates enable row level security;
drop policy if exists "Allow all public access" on public.student_certificates;
create policy "Allow all public access" on public.student_certificates for all using (true) with check (true);

-- 12.6 Dynamic Reports
create table if not exists public.dynamic_reports (
  id serial primary key,
  report_title text not null,
  module_area text not null,
  generated_date date,
  status text default 'Draft',
  file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.dynamic_reports enable row level security;
drop policy if exists "Allow all public access" on public.dynamic_reports;
create policy "Allow all public access" on public.dynamic_reports for all using (true) with check (true);

-- ====================================================================
-- SECTION 9: LESSON PLANS & ACADEMIC DIVISIONS
-- ====================================================================

-- 27. Lesson Plans (Created by Teachers, viewed by Admins)
create table if not exists public.lesson_plans (
  id bigint generated always as identity primary key,
  teacher_code text not null,
  teacher_name text not null,
  class_name text not null,
  subject_name text not null,
  topic text not null,
  objectives text,
  materials text,
  activities text,
  assessment text,
  planned_date date,
  status text default 'Submitted',
  remarks text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.lesson_plans enable row level security;
drop policy if exists "Allow all public access" on public.lesson_plans;
create policy "Allow all public access" on public.lesson_plans for all using (true) with check (true);

-- 28. Academic Divisions
create table if not exists public.academic_divisions (
  id bigint generated always as identity primary key,
  division_name text not null,
  division_type text not null,
  description text,
  assigned_classes text,
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.academic_divisions enable row level security;
drop policy if exists "Allow all public access" on public.academic_divisions;
create policy "Allow all public access" on public.academic_divisions for all using (true) with check (true);