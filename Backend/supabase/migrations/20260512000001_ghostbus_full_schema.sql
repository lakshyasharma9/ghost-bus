-- ============================================================
-- GhostBus Full Schema Migration
-- ============================================================

-- TRACKS
create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  genre text not null,
  bpm integer not null check (bpm between 60 and 220),
  musical_key text not null,
  duration text,
  description text,
  price integer not null check (price between 199 and 2000),
  transparency text not null check (transparency in ('original','loops')),
  status text not null default 'pending' check (status in ('pending','approved','rejected','sold')),
  artwork_url text,
  mastered_url text,
  unmastered_url text,
  stems_url text,
  midi_url text,
  watermarked_url text,
  tags text[] default '{}',
  plays integer not null default 0,
  views integer not null default 0,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tracks enable row level security;

create policy "Approved tracks visible to all" on public.tracks
  for select using (status in ('approved','sold'));

create policy "Sellers see own tracks" on public.tracks
  for select using (auth.uid() = seller_id);

create policy "Sellers insert own tracks" on public.tracks
  for insert with check (auth.uid() = seller_id);

create policy "Sellers update own pending tracks" on public.tracks
  for update using (auth.uid() = seller_id and status = 'pending');

-- ORDERS
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks(id),
  buyer_id uuid not null references public.profiles(id),
  seller_id uuid not null references public.profiles(id),
  amount integer not null,
  platform_fee integer not null,
  seller_payout integer not null,
  stripe_payment_intent text unique,
  stripe_session_id text unique,
  status text not null default 'pending' check (status in ('pending','paid','refunded','disputed')),
  download_token text unique default encode(gen_random_bytes(32), 'hex'),
  download_expires_at timestamptz default now() + interval '7 days',
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Buyers see own orders" on public.orders
  for select using (auth.uid() = buyer_id);

create policy "Sellers see orders for their tracks" on public.orders
  for select using (auth.uid() = seller_id);

create policy "System inserts orders" on public.orders
  for insert with check (auth.uid() = buyer_id);

-- MESSAGES
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null,
  sender_id uuid not null references public.profiles(id),
  recipient_id uuid not null references public.profiles(id),
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Users see own messages" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Users send messages" on public.messages
  for insert with check (auth.uid() = sender_id);

create policy "Recipients mark read" on public.messages
  for update using (auth.uid() = recipient_id);

-- MESSAGE THREADS (denormalized for performance)
create table public.message_threads (
  id uuid primary key default gen_random_uuid(),
  participant_a uuid not null references public.profiles(id),
  participant_b uuid not null references public.profiles(id),
  last_message text,
  last_message_at timestamptz default now(),
  unread_a integer not null default 0,
  unread_b integer not null default 0,
  created_at timestamptz not null default now(),
  unique(participant_a, participant_b)
);

alter table public.message_threads enable row level security;

create policy "Participants see threads" on public.message_threads
  for select using (auth.uid() = participant_a or auth.uid() = participant_b);

create policy "Users create threads" on public.message_threads
  for insert with check (auth.uid() = participant_a or auth.uid() = participant_b);

create policy "Participants update threads" on public.message_threads
  for update using (auth.uid() = participant_a or auth.uid() = participant_b);

-- NOTIFICATIONS
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('sale','message','review_approved','review_rejected','withdrawal','system')),
  title text not null,
  body text not null,
  read boolean not null default false,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users see own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "System inserts notifications" on public.notifications
  for insert with check (true);

create policy "Users mark own notifications read" on public.notifications
  for update using (auth.uid() = user_id);

-- KYC
create table public.kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  id_document_url text,
  address_document_url text,
  payout_email text,
  payout_method text default 'paypal' check (payout_method in ('paypal','bank','stripe')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  rejection_reason text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  submitted_at timestamptz not null default now()
);

alter table public.kyc_submissions enable row level security;

create policy "Users see own KYC" on public.kyc_submissions
  for select using (auth.uid() = user_id);

create policy "Users submit KYC" on public.kyc_submissions
  for insert with check (auth.uid() = user_id);

create policy "Users update own pending KYC" on public.kyc_submissions
  for update using (auth.uid() = user_id and status = 'pending');

-- SERVICES (gigs)
create table public.services (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  price integer not null check (price > 0),
  delivery_days integer not null check (delivery_days > 0),
  revisions integer not null default 2,
  includes text[] default '{}',
  status text not null default 'active' check (status in ('active','paused','deleted')),
  rating_avg numeric(3,2) default 0,
  rating_count integer default 0,
  orders_count integer default 0,
  created_at timestamptz not null default now()
);

alter table public.services enable row level security;

create policy "Active services visible to all" on public.services
  for select using (status = 'active');

create policy "Sellers see own services" on public.services
  for select using (auth.uid() = seller_id);

create policy "Sellers manage own services" on public.services
  for all using (auth.uid() = seller_id);

-- SERVICE ORDERS
create table public.service_orders (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id),
  buyer_id uuid not null references public.profiles(id),
  seller_id uuid not null references public.profiles(id),
  requirements text,
  amount integer not null,
  status text not null default 'pending' check (status in ('pending','in_progress','delivered','revision','completed','cancelled','disputed')),
  delivery_due_at timestamptz,
  stripe_session_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.service_orders enable row level security;

create policy "Parties see own service orders" on public.service_orders
  for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Buyers create service orders" on public.service_orders
  for insert with check (auth.uid() = buyer_id);

create policy "Parties update service orders" on public.service_orders
  for update using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- REVIEWS
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.profiles(id),
  seller_id uuid not null references public.profiles(id),
  track_id uuid references public.tracks(id),
  service_id uuid references public.services(id),
  order_id uuid references public.orders(id),
  rating integer not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now(),
  unique(reviewer_id, order_id)
);

alter table public.reviews enable row level security;

create policy "Reviews visible to all" on public.reviews
  for select using (true);

create policy "Buyers leave reviews" on public.reviews
  for insert with check (auth.uid() = reviewer_id);

-- WITHDRAWALS
create table public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id),
  amount integer not null check (amount >= 50),
  status text not null default 'pending' check (status in ('pending','processing','paid','failed')),
  payout_method text not null,
  payout_destination text not null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.withdrawals enable row level security;

create policy "Sellers see own withdrawals" on public.withdrawals
  for select using (auth.uid() = seller_id);

create policy "Sellers request withdrawals" on public.withdrawals
  for insert with check (auth.uid() = seller_id);

-- ADMIN ACTIONS LOG
create table public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id),
  action_type text not null,
  target_type text not null,
  target_id uuid not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.admin_actions enable row level security;

create policy "Admins see all actions" on public.admin_actions
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins insert actions" on public.admin_actions
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- WISHLIST
create table public.wishlists (
  user_id uuid not null references public.profiles(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

alter table public.wishlists enable row level security;

create policy "Users manage own wishlist" on public.wishlists
  for all using (auth.uid() = user_id);

-- SELLER STATS VIEW
create or replace view public.seller_stats as
select
  p.id as seller_id,
  p.display_name,
  count(distinct t.id) filter (where t.status = 'approved') as active_tracks,
  count(distinct t.id) filter (where t.status = 'sold') as sold_tracks,
  count(distinct t.id) filter (where t.status = 'pending') as pending_tracks,
  coalesce(sum(o.seller_payout) filter (where o.status = 'paid'), 0) as total_earned,
  coalesce(sum(o.seller_payout) filter (where o.status = 'paid' and o.created_at > now() - interval '30 days'), 0) as earned_this_month
from public.profiles p
left join public.tracks t on t.seller_id = p.id
left join public.orders o on o.seller_id = p.id
where p.role in ('seller','admin')
group by p.id, p.display_name;

-- ENABLE REALTIME
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.message_threads;
alter publication supabase_realtime add table public.tracks;
alter publication supabase_realtime add table public.orders;

-- UPDATED_AT TRIGGER
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger tracks_updated_at before update on public.tracks
  for each row execute function public.set_updated_at();

create trigger service_orders_updated_at before update on public.service_orders
  for each row execute function public.set_updated_at();

-- INDEXES
create index tracks_seller_id_idx on public.tracks(seller_id);
create index tracks_status_idx on public.tracks(status);
create index tracks_genre_idx on public.tracks(genre);
create index orders_buyer_id_idx on public.orders(buyer_id);
create index orders_seller_id_idx on public.orders(seller_id);
create index messages_thread_id_idx on public.messages(thread_id);
create index notifications_user_id_idx on public.notifications(user_id);
create index notifications_read_idx on public.notifications(user_id, read);
