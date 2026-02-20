-- vendor_config
create table vendor_config (
  id uuid primary key default gen_random_uuid(),
  shop_name text not null,
  vendor_type text not null check (vendor_type in ('coffee','pizza','florist')),
  primary_color text not null default '#7C3AED',
  website_url text,
  stripe_webhook_secret text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- order_log
create table order_log (
  id uuid primary key default gen_random_uuid(),
  vendor_config_id uuid references vendor_config(id),
  order_number text not null,
  customer_name text,
  items jsonb not null default '[]'::jsonb,
  amount_cents integer,
  currency text not null default 'aud',
  source text not null check (source in ('stripe','manual')),
  status text not null default 'received',
  stripe_event_id text unique,
  created_at timestamptz not null default now()
);

-- error_log
create table error_log (
  id uuid primary key default gen_random_uuid(),
  error_message text not null,
  stack_trace text,
  context jsonb,
  created_at timestamptz not null default now()
);

-- RLS
alter table vendor_config enable row level security;
alter table order_log enable row level security;
alter table error_log enable row level security;

create policy "anon_read_vendor_config" on vendor_config for select to anon using (true);
create policy "anon_read_order_log" on order_log for select to anon using (true);
create policy "anon_insert_order_log" on order_log for insert to anon with check (true);
create policy "anon_insert_error_log" on error_log for insert to anon with check (true);

-- Enable realtime for order_log
alter publication supabase_realtime add table order_log;
