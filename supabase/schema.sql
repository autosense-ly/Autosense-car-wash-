-- =========================================================
-- AutoSense / WashFlow — Schema v3 (reference snapshot)
-- Project: Car wash daud 2 (cxhrnopvwtzccquowjmb)
-- This mirrors what is actually live in Supabase. It was applied
-- directly via Claude's Supabase connection, not through a CLI/migration
-- pipeline — this file exists so the schema is visible in the repo, not
-- only in the dashboard. If the live schema changes, update this file
-- to match, or ask Claude to regenerate it from the live project.
-- =========================================================

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id),
  currency text not null default 'LYD',
  language text default 'en',
  workflow_mode text default 'detailed',
  created_at timestamptz not null default now()
);

create table if not exists app_users (
  id uuid primary key references auth.users(id),
  business_id uuid not null references businesses(id) on delete cascade,
  role text not null check (role in ('owner', 'manager')),
  name text not null,
  email text not null,
  language text default 'en',
  created_at timestamptz not null default now()
);

create table if not exists manager_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references app_users(id) on delete cascade,
  dashboard boolean default false,
  reports boolean default false,
  expenses boolean default false,
  workers boolean default false,
  services boolean default true,
  payments boolean default true,
  checkin boolean default true,
  live_operations boolean default true,
  customers boolean default true,
  vehicles boolean default true,
  settings boolean default false
);

create table if not exists workers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  phone text,
  pay_type text not null default 'salary' check (pay_type in ('salary', 'percentage')),
  salary_amount numeric(10,2),
  salary_frequency text check (salary_frequency in ('daily', 'weekly', 'monthly')),
  percentage_rate numeric(5,2),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  plate_number text not null,
  car_model text,
  car_color text,
  created_at timestamptz not null default now()
);

create index if not exists idx_vehicles_business_plate on vehicles(business_id, plate_number);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  category text,
  pricing_type text not null default 'fixed' check (pricing_type in ('fixed', 'quantity', 'custom')),
  price numeric(10,2),
  unit_name text,
  duration_minutes int,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists service_fields (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  label text not null,
  field_type text not null default 'text' check (field_type in ('text', 'number', 'select')),
  unit text,
  required boolean not null default false,
  options text[],
  sort_order int not null default 0
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  vehicle_id uuid references vehicles(id) on delete set null,
  customer_id uuid references customers(id) on delete set null,
  plate_number text,
  customer_name text,
  customer_phone text,
  car_model text,
  car_color text,
  assigned_worker_id uuid references workers(id) on delete set null,
  status text not null default 'waiting'
    check (status in ('waiting', 'in_progress', 'ready', 'completed', 'cancelled')),
  notes text,
  subtotal numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  created_by uuid references app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_jobs_business_status on jobs(business_id, status);

create table if not exists job_services (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  service_id uuid references services(id) on delete set null,
  service_name text not null,
  quantity numeric(10,2) not null default 1,
  unit_price numeric(10,2) not null default 0,
  line_total numeric(10,2) not null default 0,
  custom_field_values jsonb
);

create or replace function touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_jobs_touch_updated_at on jobs;
create trigger trg_jobs_touch_updated_at
before update on jobs
for each row execute function touch_updated_at();

create table if not exists job_status_history (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  status text not null,
  changed_at timestamptz not null default now()
);

create or replace function log_job_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into job_status_history (job_id, status, changed_at) values (new.id, new.status, now());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_job_status_change on jobs;
create trigger trg_log_job_status_change
after insert or update of status on jobs
for each row execute function log_job_status_change();

-- security_invoker = true is required on every view below. Without it,
-- views run with the CREATOR's permissions and silently bypass RLS,
-- leaking every business's data to any logged-in user. Real bug caught
-- by Supabase's advisor during setup — do not remove this.
create or replace view job_duration_stats
with (security_invoker = true) as
select
  job_id,
  min(changed_at) filter (where status = 'in_progress') as started_at,
  min(changed_at) filter (where status in ('ready', 'completed')) as finished_at
from job_status_history
group by job_id;
-- avg service time: select avg(finished_at - started_at) from job_duration_stats where finished_at is not null;

create or replace view vehicle_visit_stats
with (security_invoker = true) as
select vehicle_id, count(*) as visit_count, max(created_at) as last_visit_at
from jobs where vehicle_id is not null
group by vehicle_id;

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  method text not null check (method in ('cash', 'bank_transfer')),
  collected_by uuid references app_users(id),
  created_at timestamptz not null default now()
);

create or replace view job_payment_status
with (security_invoker = true) as
select
  j.id as job_id,
  j.total,
  coalesce(sum(p.amount), 0) as amount_paid,
  case
    when coalesce(sum(p.amount), 0) <= 0 then 'unpaid'
    when coalesce(sum(p.amount), 0) < j.total then 'partial'
    else 'paid'
  end as payment_status
from jobs j
left join payments p on p.job_id = j.id
group by j.id, j.total;

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  category text,
  name text not null,
  unit text,
  quantity numeric(10,2) default 1,
  amount numeric(10,2) not null,
  expense_date date not null default current_date,
  notes text,
  created_by uuid references app_users(id),
  created_at timestamptz not null default now()
);

create or replace function create_owner_profile(
  business_name text, business_currency text, owner_name text, owner_email text
)
returns businesses
language plpgsql security definer set search_path = public as $$
declare
  new_business businesses;
begin
  insert into businesses (name, currency, owner_id)
    values (business_name, business_currency, auth.uid())
    returning * into new_business;

  insert into app_users (id, business_id, role, name, email)
    values (auth.uid(), new_business.id, 'owner', owner_name, owner_email);

  return new_business;
end;
$$;

create or replace function join_business_as_manager(
  target_business_id uuid, manager_name text, manager_email text
)
returns app_users
language plpgsql security definer set search_path = public as $$
declare
  new_profile app_users;
begin
  if not exists (select 1 from businesses where id = target_business_id) then
    raise exception using message = 'Business not found';
  end if;

  insert into app_users (id, business_id, role, name, email)
    values (auth.uid(), target_business_id, 'manager', manager_name, manager_email)
    returning * into new_profile;

  insert into manager_permissions
    (user_id, dashboard, reports, expenses, workers, services, payments, checkin, live_operations, customers, vehicles, settings)
    values (auth.uid(), false, false, false, false, true, true, true, true, true, true, false);

  return new_profile;
end;
$$;

alter table businesses enable row level security;
alter table app_users enable row level security;
alter table manager_permissions enable row level security;
alter table workers enable row level security;
alter table customers enable row level security;
alter table vehicles enable row level security;
alter table services enable row level security;
alter table service_fields enable row level security;
alter table jobs enable row level security;
alter table job_services enable row level security;
alter table job_status_history enable row level security;
alter table payments enable row level security;
alter table expenses enable row level security;

create or replace function auth_business_id()
returns uuid language sql stable security definer set search_path = public as $$
  select business_id from app_users where id = auth.uid();
$$;

create or replace function auth_role()
returns text language sql stable security definer set search_path = public as $$
  select role from app_users where id = auth.uid();
$$;

create or replace function auth_perm(col text)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare result boolean;
begin
  execute format('select %I from manager_permissions where user_id = $1', col) into result using auth.uid();
  return coalesce(result, false);
end;
$$;

create policy "businesses_select" on businesses for select using (id = auth_business_id());
create policy "app_users_select" on app_users for select using (business_id = auth_business_id());
create policy "workers_select" on workers for select using (business_id = auth_business_id());
create policy "customers_select" on customers for select using (business_id = auth_business_id());
create policy "vehicles_select" on vehicles for select using (business_id = auth_business_id());
create policy "services_select" on services for select using (business_id = auth_business_id());
create policy "jobs_select" on jobs for select using (business_id = auth_business_id());
create policy "payments_select" on payments for select using (business_id = auth_business_id());
create policy "expenses_select" on expenses for select using (business_id = auth_business_id());
create policy "service_fields_select" on service_fields for select
  using (service_id in (select id from services where business_id = auth_business_id()));
create policy "job_services_select" on job_services for select
  using (job_id in (select id from jobs where business_id = auth_business_id()));
create policy "job_status_history_select" on job_status_history for select
  using (job_id in (select id from jobs where business_id = auth_business_id()));

create policy "workers_write" on workers for all
  using (business_id = auth_business_id() and (auth_role() = 'owner' or auth_perm('workers')))
  with check (business_id = auth_business_id() and (auth_role() = 'owner' or auth_perm('workers')));

create policy "customers_write" on customers for all
  using (business_id = auth_business_id() and (auth_role() = 'owner' or auth_perm('customers')))
  with check (business_id = auth_business_id() and (auth_role() = 'owner' or auth_perm('customers')));

create policy "vehicles_write" on vehicles for all
  using (business_id = auth_business_id() and (auth_role() = 'owner' or auth_perm('vehicles')))
  with check (business_id = auth_business_id() and (auth_role() = 'owner' or auth_perm('vehicles')));

create policy "services_write" on services for all
  using (business_id = auth_business_id() and (auth_role() = 'owner' or auth_perm('services')))
  with check (business_id = auth_business_id() and (auth_role() = 'owner' or auth_perm('services')));

create policy "service_fields_write" on service_fields for all
  using (service_id in (select id from services where business_id = auth_business_id() and (auth_role() = 'owner' or auth_perm('services'))))
  with check (service_id in (select id from services where business_id = auth_business_id() and (auth_role() = 'owner' or auth_perm('services'))));

create policy "jobs_write" on jobs for all
  using (business_id = auth_business_id() and (auth_role() = 'owner' or auth_perm('checkin') or auth_perm('live_operations')))
  with check (business_id = auth_business_id() and (auth_role() = 'owner' or auth_perm('checkin') or auth_perm('live_operations')));

create policy "job_services_write" on job_services for all
  using (job_id in (select id from jobs where business_id = auth_business_id() and (auth_role() = 'owner' or auth_perm('checkin') or auth_perm('live_operations'))))
  with check (job_id in (select id from jobs where business_id = auth_business_id() and (auth_role() = 'owner' or auth_perm('checkin') or auth_perm('live_operations'))));

create policy "payments_write" on payments for all
  using (business_id = auth_business_id() and (auth_role() = 'owner' or auth_perm('payments')))
  with check (business_id = auth_business_id() and (auth_role() = 'owner' or auth_perm('payments')));

create policy "expenses_write" on expenses for all
  using (business_id = auth_business_id() and (auth_role() = 'owner' or auth_perm('expenses')))
  with check (business_id = auth_business_id() and (auth_role() = 'owner' or auth_perm('expenses')));

create policy "app_users_write_self" on app_users for update
  using (id = auth.uid()) with check (id = auth.uid());

create policy "manager_permissions_owner_manage" on manager_permissions for all
  using (auth_role() = 'owner' and user_id in (select id from app_users where business_id = auth_business_id()))
  with check (auth_role() = 'owner' and user_id in (select id from app_users where business_id = auth_business_id()));

create policy "manager_permissions_self_select" on manager_permissions for select
  using (user_id = auth.uid());

-- auth_business_id/auth_role/auth_perm run INSIDE every RLS policy above.
-- Both anon and authenticated need EXECUTE — revoking anon's access here
-- doesn't hide data, it makes every anonymous query error with
-- "permission denied" instead of cleanly returning zero rows. Learned
-- this the hard way during connection testing.
revoke execute on function auth_business_id() from public;
revoke execute on function auth_role() from public;
revoke execute on function auth_perm(text) from public;
grant execute on function auth_business_id() to anon, authenticated;
grant execute on function auth_role() to anon, authenticated;
grant execute on function auth_perm(text) to anon, authenticated;

-- Trigger-only, no legitimate reason for anyone to call it directly.
revoke execute on function log_job_status_change() from public;

-- Sign-up flow: user calls supabase.auth.signUp() first (becomes
-- authenticated), then calls these. No anonymous use case.
revoke execute on function create_owner_profile(text, text, text, text) from public;
revoke execute on function join_business_as_manager(uuid, text, text) from public;
grant execute on function create_owner_profile(text, text, text, text) to authenticated;
grant execute on function join_business_as_manager(uuid, text, text) to authenticated;
