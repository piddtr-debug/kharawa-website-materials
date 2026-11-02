-- Run in Supabase SQL Editor.
-- Replace the bucket name in Storage policies if your bucket differs.

create table if not exists public.consignments (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  category text not null,
  condition text not null,
  price numeric check (price is null or price >= 0),
  contact text not null,
  details text,
  photo_path text,
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'approved', 'listed', 'sold', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists consignments_status_idx on public.consignments(status);
create index if not exists consignments_created_at_idx on public.consignments(created_at desc);

alter table public.consignments enable row level security;

-- Admin Dashboard requires a signed-in Supabase user with app_metadata.role = 'admin'.
create policy "admins can read consignments"
on public.consignments
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admins can update consignment status"
on public.consignments
for update
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- The public submission form should write through an Edge Function, not anon INSERT.
-- Keep the service_role key inside the Edge Function secret store only.
-- The Edge Function validates the payload, uploads the image, and inserts the row.
