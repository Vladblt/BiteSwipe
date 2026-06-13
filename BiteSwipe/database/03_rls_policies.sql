-- ============================================================
-- BiteSwipe - Row Level Security
-- Ruleaza DUPA 01_schema.sql
-- ============================================================

alter table profiles enable row level security;
alter table swipes enable row level security;
alter table reservations enable row level security;
alter table restaurants enable row level security;
alter table companies enable row level security;

-- Restaurante si companii sunt publice
create policy "Restaurantele sunt publice"
  on restaurants for select using (is_active = true);

create policy "Companiile sunt publice"
  on companies for select using (true);

-- Profile: fiecare user vede si modifica doar profilul sau
create policy "Userul isi vede profilul"
  on profiles for select using (auth.uid() = id);

create policy "Userul isi updateaza profilul"
  on profiles for update using (auth.uid() = id);

create policy "Profilul se creeaza la signup"
  on profiles for insert with check (auth.uid() = id);

-- Swipes: fiecare user vede si creeaza doar swipe-urile sale
create policy "Userul vede swipe-urile sale"
  on swipes for select using (auth.uid() = user_id);

create policy "Userul poate crea swipe-uri"
  on swipes for insert with check (auth.uid() = user_id);

-- Rezervari: clientul vede si creeaza ale sale
create policy "Clientul vede rezervarile sale"
  on reservations for select using (auth.uid() = user_id);

create policy "Clientul poate crea rezervari"
  on reservations for insert with check (auth.uid() = user_id);

create policy "Clientul poate anula rezervarile sale"
  on reservations for update
  using (auth.uid() = user_id and status = 'pending');

-- Rezervari: staff-ul vede si gestioneaza rezervarile restaurantului sau
create policy "Staff vede rezervarile restaurantului"
  on reservations for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'staff'
        and profiles.restaurant_id = reservations.restaurant_id
    )
  );

create policy "Staff poate confirma sau respinge"
  on reservations for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'staff'
        and profiles.restaurant_id = reservations.restaurant_id
    )
  );
