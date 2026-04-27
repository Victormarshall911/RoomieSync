-- 1. Create the 'student-ids' bucket (if it doesn't exist)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'student-ids', 
  'student-ids', 
  false, 
  5242880, -- 5MB limit
  '{image/jpeg,image/png,application/pdf}' -- Only images and PDFs
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Cleanup existing policies to avoid "already exists" errors
drop policy if exists "Users can upload their own student IDs" on storage.objects;
drop policy if exists "Users can view their own student IDs" on storage.objects;
drop policy if exists "Users can update their own student IDs" on storage.objects;
drop policy if exists "Users can delete their own student IDs" on storage.objects;
drop policy if exists "Admins can view all student IDs" on storage.objects;

-- 2. Allow authenticated users to upload their own student ID (INSERT)
create policy "Users can upload their own student IDs"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'student-ids' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Allow users to view their own uploaded ID (SELECT)
create policy "Users can view their own student IDs"
on storage.objects for select
to authenticated
using (
  bucket_id = 'student-ids' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Allow users to update their own student IDs (UPDATE - needed for fixes/re-uploads)
create policy "Users can update their own student IDs"
on storage.objects for update
to authenticated
using (
  bucket_id = 'student-ids' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Allow users to delete their own student IDs (DELETE - for cleanup)
create policy "Users can delete their own student IDs"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'student-ids' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Allow admins to see all student IDs
create policy "Admins can view all student IDs"
on storage.objects for select
to authenticated
using (
  bucket_id = 'student-ids' AND
  exists (
    select 1 from profiles
    where id = auth.uid() and is_admin = true
  )
);
