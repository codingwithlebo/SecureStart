-- SecureStart: schema, row-level security, and server-side functions.
-- Role is chosen at sign up (profiles trigger). Permissions are enforced here, not in the UI.

create type user_role as enum ('owner', 'administrator');
create type response_type as enum ('yes', 'partly', 'no', 'na');
create type severity as enum ('critical', 'high', 'medium', 'low');
create type finding_status as enum ('open', 'in_progress', 'resolved', 'accepted');
create type assessment_status as enum ('draft', 'submitted');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role user_role not null,
  created_at timestamptz not null default now()
);

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  industry text not null,
  size_band text not null check (size_band in ('1-5', '6-20', '21-50')),
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create table org_members (
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  member_role user_role not null,
  primary key (org_id, user_id)
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  text text not null,
  guidance text not null,
  remediation text not null,
  popia_ref text,
  severity severity not null,
  weight int not null check (weight between 1 and 5),
  sort_order int not null unique
);

create table assessments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  started_by uuid not null references profiles(id),
  status assessment_status not null default 'draft',
  score int check (score between 0 and 100),
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);

create table answers (
  assessment_id uuid not null references assessments(id) on delete cascade,
  question_id uuid not null references questions(id),
  response response_type not null,
  primary key (assessment_id, question_id)
);

create table findings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  question_id uuid not null references questions(id),
  first_assessment_id uuid not null references assessments(id),
  priority severity not null,
  status finding_status not null default 'open',
  assignee_id uuid references profiles(id) on delete set null,
  due_date date,
  notes text not null default '',
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, question_id)
);

create table finding_events (
  id uuid primary key default gen_random_uuid(),
  finding_id uuid not null references findings(id) on delete cascade,
  actor_id uuid references profiles(id),
  from_status finding_status,
  to_status finding_status not null,
  created_at timestamptz not null default now()
);

create index on org_members (user_id);
create index on assessments (org_id);
create index on findings (org_id, status);
create index on finding_events (finding_id);

-- Membership helpers. SECURITY DEFINER so policies on org_members cannot recurse.
create function is_org_member(p_org uuid) returns boolean
  language sql stable security definer set search_path = public as
  $$ select exists (select 1 from org_members where org_id = p_org and user_id = auth.uid()) $$;

create function is_org_admin(p_org uuid) returns boolean
  language sql stable security definer set search_path = public as
  $$ select exists (select 1 from org_members where org_id = p_org and user_id = auth.uid() and member_role = 'administrator') $$;

create function is_org_owner(p_org uuid) returns boolean
  language sql stable security definer set search_path = public as
  $$ select exists (select 1 from org_members where org_id = p_org and user_id = auth.uid() and member_role = 'owner') $$;

-- Same rules as src/lib/scoring.ts: No keeps severity, Partly lowers one level (floor Low), Yes/NA = no finding.
create function derive_priority(sev severity, resp response_type) returns severity
  language sql immutable as
  $$ select case
       when resp in ('yes', 'na') then null
       when resp = 'no' then sev
       else case sev when 'critical' then 'high'::severity when 'high' then 'medium'::severity else 'low'::severity end
     end $$;

-- Create a profile when someone signs up. Role and name come from sign-up metadata.
create function handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'owner')
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Firm creation and membership go through functions only (no direct inserts).
create function create_organization(p_name text, p_industry text, p_size_band text) returns uuid
  language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'owner') then
    raise exception 'Only business owners can create a firm';
  end if;
  if exists (select 1 from org_members where user_id = auth.uid() and member_role = 'owner') then
    raise exception 'You already have a firm';
  end if;
  insert into organizations (name, industry, size_band, created_by)
    values (trim(p_name), p_industry, p_size_band, auth.uid()) returning id into v_id;
  insert into org_members (org_id, user_id, member_role) values (v_id, auth.uid(), 'owner');
  return v_id;
end $$;

create function add_administrator(p_org uuid, p_email text) returns void
  language plpgsql security definer set search_path = public as $$
declare v_user uuid;
begin
  if not is_org_owner(p_org) then
    raise exception 'Only the firm owner can add administrators';
  end if;
  select u.id into v_user from auth.users u join profiles p on p.id = u.id
    where lower(u.email) = lower(trim(p_email)) and p.role = 'administrator';
  if v_user is null then
    raise exception 'No administrator account found for this email';
  end if;
  insert into org_members (org_id, user_id, member_role) values (p_org, v_user, 'administrator')
    on conflict do nothing;
end $$;

-- Submit: validates, scores, creates/reopens/auto-resolves findings, locks the assessment. Returns the score.
create function submit_assessment(p_assessment uuid) returns int
  language plpgsql security definer set search_path = public as $$
declare v_org uuid; v_status assessment_status; v_score int;
begin
  select org_id, status into v_org, v_status from assessments where id = p_assessment;
  if v_org is null or not is_org_member(v_org) then raise exception 'Assessment not found'; end if;
  if v_status <> 'draft' then raise exception 'Assessment already submitted'; end if;
  if (select count(*) from answers where assessment_id = p_assessment) <> (select count(*) from questions) then
    raise exception 'Answer every question before submitting';
  end if;

  select round(100 * sum((case a.response when 'yes' then 1 when 'partly' then 0.5 else 0 end) * q.weight) / sum(q.weight))::int
    into v_score
    from answers a join questions q on q.id = a.question_id
    where a.assessment_id = p_assessment and a.response <> 'na';

  insert into findings (org_id, question_id, first_assessment_id, priority)
    select v_org, q.id, p_assessment, derive_priority(q.severity, a.response)
    from answers a join questions q on q.id = a.question_id
    where a.assessment_id = p_assessment and derive_priority(q.severity, a.response) is not null
  on conflict (org_id, question_id) do update
    set status = 'open', priority = excluded.priority
    where findings.status = 'resolved';

  update findings f set status = 'resolved'
    from answers a
    where a.assessment_id = p_assessment and a.question_id = f.question_id
      and f.org_id = v_org and a.response in ('yes', 'na') and f.status in ('open', 'in_progress');

  update assessments set status = 'submitted', score = v_score, submitted_at = now() where id = p_assessment;
  return v_score;
end $$;

-- Findings: timestamps, owner restrictions and an audit trail of status changes.
create function findings_guard() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  if new.status = 'resolved' and old.status <> 'resolved' then new.resolved_at := now();
  elsif new.status <> 'resolved' then new.resolved_at := null;
  end if;
  if current_user = 'authenticated' then
    if new.org_id <> old.org_id or new.question_id <> old.question_id
       or new.first_assessment_id <> old.first_assessment_id
       or new.priority <> old.priority or new.created_at <> old.created_at then
      raise exception 'These fields cannot be changed';
    end if;
    if not is_org_admin(old.org_id)
       and (new.assignee_id is distinct from old.assignee_id or new.due_date is distinct from old.due_date) then
      raise exception 'Only administrators can change the assignee or due date';
    end if;
  end if;
  return new;
end $$;

create trigger findings_guard_trg before update on findings
  for each row execute function findings_guard();

create function log_finding_status() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if old.status is distinct from new.status then
    insert into finding_events (finding_id, actor_id, from_status, to_status)
    values (new.id, auth.uid(), old.status, new.status);
  end if;
  return new;
end $$;

create trigger findings_log_trg after update on findings
  for each row execute function log_finding_status();

-- Row-level security: deny by default, then allow.
alter table profiles enable row level security;
alter table organizations enable row level security;
alter table org_members enable row level security;
alter table questions enable row level security;
alter table assessments enable row level security;
alter table answers enable row level security;
alter table findings enable row level security;
alter table finding_events enable row level security;

create policy profiles_select on profiles for select to authenticated
  using (id = auth.uid() or exists (
    select 1 from org_members a join org_members b on a.org_id = b.org_id
    where a.user_id = auth.uid() and b.user_id = profiles.id));
create policy profiles_update on profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy orgs_select on organizations for select to authenticated using (is_org_member(id));
create policy orgs_update on organizations for update to authenticated
  using (is_org_owner(id)) with check (is_org_owner(id));

create policy members_select on org_members for select to authenticated using (is_org_member(org_id));

create policy questions_select on questions for select to authenticated using (true);

create policy assessments_select on assessments for select to authenticated using (is_org_member(org_id));
create policy assessments_insert on assessments for insert to authenticated
  with check (is_org_member(org_id) and started_by = auth.uid() and status = 'draft' and score is null);
create policy assessments_update on assessments for update to authenticated
  using (is_org_member(org_id) and status = 'draft')
  with check (is_org_member(org_id) and status = 'draft' and score is null);

create policy answers_select on answers for select to authenticated
  using (exists (select 1 from assessments a where a.id = assessment_id and is_org_member(a.org_id)));
create policy answers_write on answers for all to authenticated
  using (exists (select 1 from assessments a where a.id = assessment_id and a.status = 'draft' and is_org_member(a.org_id)))
  with check (exists (select 1 from assessments a where a.id = assessment_id and a.status = 'draft' and is_org_member(a.org_id)));

create policy findings_select on findings for select to authenticated using (is_org_member(org_id));
create policy findings_update on findings for update to authenticated
  using (is_org_member(org_id)) with check (is_org_member(org_id));

create policy events_select on finding_events for select to authenticated
  using (exists (select 1 from findings f where f.id = finding_id and is_org_member(f.org_id)));

-- Privileges: nothing for anonymous users; limited columns where the UI edits only a few fields.
revoke all on all tables in schema public from anon;
revoke update on profiles from authenticated;
grant update (full_name) on profiles to authenticated;
revoke update on organizations from authenticated;
grant update (name, industry, size_band) on organizations to authenticated;

revoke all on function is_org_member(uuid), is_org_admin(uuid), is_org_owner(uuid),
  create_organization(text, text, text), add_administrator(uuid, text), submit_assessment(uuid)
  from public, anon;
grant execute on function is_org_member(uuid), is_org_admin(uuid), is_org_owner(uuid),
  create_organization(text, text, text), add_administrator(uuid, text), submit_assessment(uuid)
  to authenticated;
