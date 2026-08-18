alter table public.outreach_programs
  add column if not exists reported_attendance_count integer not null default 0
    check (reported_attendance_count >= 0),
  add column if not exists reported_new_leads_count integer not null default 0
    check (reported_new_leads_count >= 0 and reported_new_leads_count <= reported_attendance_count);

