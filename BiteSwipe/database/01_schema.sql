-- ============================================================
-- BiteSwipe - Schema baza de date
-- Ruleaza in ordinea: 01 -> 02 -> 03
-- ============================================================

create extension if not exists "uuid-ossp";

-- Lanturile de restaurante (ex: Crama Veche SRL cu mai multe locatii)
create table companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz default now()
);

-- Locatiile individuale
create table restaurants (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  description text,
  address text not null,
  city text not null,
  cuisine_type text,
  price_range smallint check (price_range between 1 and 3),
  capacity integer not null,
  opening_time time default '10:00',
  closing_time time default '23:00',
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Profile utilizatori (extensie a auth.users din Supabase)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text default 'client' check (role in ('client', 'staff')),
  restaurant_id uuid references restaurants(id),
  created_at timestamptz default now()
);

-- Gesturile de swipe
create table swipes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  restaurant_id uuid references restaurants(id) on delete cascade,
  direction text not null check (direction in ('left', 'right')),
  created_at timestamptz default now(),
  unique(user_id, restaurant_id)
);

-- Rezervarile
create table reservations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  restaurant_id uuid references restaurants(id) on delete cascade,
  reservation_date date not null,
  reservation_time time not null,
  party_size smallint not null check (party_size between 1 and 20),
  status text default 'pending' check (status in ('pending', 'confirmed', 'rejected', 'cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- Indecsi pentru performanta
create index on restaurants(city);
create index on restaurants(cuisine_type);
create index on swipes(user_id);
create index on reservations(restaurant_id, reservation_date);
create index on reservations(user_id);
