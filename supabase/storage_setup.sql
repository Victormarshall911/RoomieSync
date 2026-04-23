-- Create the 'student-ids' bucket for verification images
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

-- Allow authenticated users to upload their own student ID letter
create policy "Users can upload their own student IDs"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'student-ids' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to see their own uploaded ID letter
create policy "Users can view their own student IDs"
on storage.objects for select
to authenticated
using (
  bucket_id = 'student-ids' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to see all student IDs
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
