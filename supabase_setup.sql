-- =====================================================================
-- SUPABASE DATABASE SETUP & SEEDING SCRIPT
-- =====================================================================
-- Copy and paste this script directly into your Supabase SQL Editor.
-- This script creates the users, frames, and orders tables, and
-- populates them with the exact 21 models, colors, and variant prices.

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Create Users Table
create table if not exists public.users (
  id text primary key,
  name text not null,
  role text not null check (role in ('staff', 'manager', 'admin')),
  avatar_color text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Frames Table
create table if not exists public.frames (
  id text primary key,
  name text unique not null,
  colors text[] not null,
  variants jsonb not null, -- Array of objects: {color: string, lens: string, price: number}
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Orders Table
create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  frame_name text not null references public.frames(name) on update cascade,
  frame_color text not null,
  lens_type text not null,
  lens_color text not null,
  price integer not null,
  prescription jsonb default '{"hasPrescription": false}'::jsonb not null,
  special_instructions text,
  assigned_to text references public.users(id) on delete set null,
  status text default 'Waiting' not null,
  checklist jsonb default '{"confirmFrame": false, "verifyLens": false, "addCase": false, "addCloth": false, "includeInvoice": false, "preparePackage": false}'::jsonb not null,
  proof_photos text[] default '{}'::text[] not null,
  issue jsonb,
  history jsonb default '[]'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) policies
alter table public.users enable row level security;
alter table public.frames enable row level security;
alter table public.orders enable row level security;

-- Setup public read-write policies (bypass restrictions for demo/client operations)
drop policy if exists "Allow public read-write for users" on public.users;
create policy "Allow public read-write for users" on public.users for all using (true) with check (true);

drop policy if exists "Allow public read-write for frames" on public.frames;
create policy "Allow public read-write for frames" on public.frames for all using (true) with check (true);

drop policy if exists "Allow public read-write for orders" on public.orders;
create policy "Allow public read-write for orders" on public.orders for all using (true) with check (true);

-- 4. Seed Users Data
insert into public.users (id, name, role, avatar_color) values
  ('dhanesh', 'Dhanesh K.', 'staff', '#8B5CF6'),
  ('sarah', 'Sarah L.', 'staff', '#0f172a'),
  ('marcus', 'Marcus G.', 'staff', '#1e3a8a'),
  ('rohan', 'Rohan', 'admin', '#F59E0B')
on conflict (id) do update set
  name = excluded.name,
  role = excluded.role,
  avatar_color = excluded.avatar_color;

-- 5. Seed Frames Data (21 Catalog Models)
insert into public.frames (id, name, colors, variants) values
  ('frame_1', 'Borderline', array['Gold', 'Gunmetal', 'MatteBlack'], 
   '[{"color": "Gold", "lens": "Green", "price": 8200}, {"color": "Gold", "lens": "Rose", "price": 8200}, {"color": "Gold", "lens": "RX", "price": 7800}, {"color": "Gunmetal", "lens": "Blue", "price": 8200}, {"color": "Gunmetal", "lens": "Purple", "price": 8200}, {"color": "Gunmetal", "lens": "RX", "price": 7800}, {"color": "MatteBlack", "lens": "BlackFade", "price": 8200}, {"color": "MatteBlack", "lens": "Olive", "price": 8200}, {"color": "MatteBlack", "lens": "RX", "price": 7800}]'::jsonb),

  ('frame_2', 'Coastline', array['BlackCore', 'BlackShell', 'Champagne', 'Havana', 'MatteBlack'], 
   '[{"color": "BlackCore", "lens": "Purple", "price": 7600}, {"color": "BlackCore", "lens": "RX", "price": 7200}, {"color": "BlackShell", "lens": "Black", "price": 7600}, {"color": "BlackShell", "lens": "RX", "price": 7200}, {"color": "Champagne", "lens": "Orange", "price": 7600}, {"color": "Champagne", "lens": "RX", "price": 7200}, {"color": "Havana", "lens": "RX", "price": 7200}, {"color": "Havana", "lens": "SkyBlue", "price": 7600}, {"color": "MatteBlack", "lens": "RX", "price": 7200}, {"color": "MatteBlack", "lens": "Yellow", "price": 7600}]'::jsonb),

  ('frame_3', 'Crossfire', array['Anthracite', 'Bronze', 'Gold'], 
   '[{"color": "Anthracite", "lens": "BlackFade", "price": 8900}, {"color": "Anthracite", "lens": "RX", "price": 8200}, {"color": "Bronze", "lens": "GreenFade", "price": 8900}, {"color": "Bronze", "lens": "RX", "price": 8200}, {"color": "Gold", "lens": "Brown", "price": 8900}, {"color": "Gold", "lens": "RX", "price": 8200}]'::jsonb),

  ('frame_4', 'Downtime', array['Black', 'BlackShell', 'Havana', 'Navy', 'Smoke'], 
   '[{"color": "Black", "lens": "Black", "price": 8000}, {"color": "Black", "lens": "RX", "price": 7600}, {"color": "BlackShell", "lens": "BlackFade", "price": 8000}, {"color": "BlackShell", "lens": "RX", "price": 7600}, {"color": "Havana", "lens": "GreenFade", "price": 8000}, {"color": "Havana", "lens": "RX", "price": 7600}, {"color": "Navy", "lens": "Brown", "price": 8000}, {"color": "Navy", "lens": "RX", "price": 7600}, {"color": "Smoke", "lens": "Rose", "price": 8000}, {"color": "Smoke", "lens": "RX", "price": 7600}]'::jsonb),

  ('frame_5', 'Fulton', array['Black', 'BlackShell', 'Emerald', 'Rust', 'Smoke'], 
   '[{"color": "Black", "lens": "Orange", "price": 8000}, {"color": "Black", "lens": "RX", "price": 7600}, {"color": "BlackShell", "lens": "Black", "price": 8000}, {"color": "BlackShell", "lens": "RX", "price": 7600}, {"color": "Emerald", "lens": "RX", "price": 7600}, {"color": "Emerald", "lens": "SkyBlue", "price": 8000}, {"color": "Rust", "lens": "Brown", "price": 8000}, {"color": "Rust", "lens": "RX", "price": 7600}, {"color": "Smoke", "lens": "Olive", "price": 8000}, {"color": "Smoke", "lens": "RX", "price": 7600}]'::jsonb),

  ('frame_6', 'Highline', array['Anthracite', 'Gold', 'Silver'], 
   '[{"color": "Anthracite", "lens": "Olive", "price": 8200}, {"color": "Anthracite", "lens": "RX", "price": 7800}, {"color": "Gold", "lens": "BrownFade", "price": 8200}, {"color": "Gold", "lens": "Peach", "price": 8200}, {"color": "Gold", "lens": "RX", "price": 7800}, {"color": "Silver", "lens": "Purple", "price": 8200}, {"color": "Silver", "lens": "RX", "price": 7800}]'::jsonb),

  ('frame_7', 'Overture', array['Black', 'BlackCore', 'Champagne', 'Navy', 'Sage'], 
   '[{"color": "Black", "lens": "Black", "price": 8000}, {"color": "BlackCore", "lens": "Green", "price": 8000}, {"color": "BlackCore", "lens": "RX", "price": 7600}, {"color": "Black", "lens": "RX", "price": 7600}, {"color": "Champagne", "lens": "Brown", "price": 8000}, {"color": "Champagne", "lens": "RX", "price": 7600}, {"color": "Navy", "lens": "Black", "price": 8000}, {"color": "Navy", "lens": "RX", "price": 7600}, {"color": "Sage", "lens": "BrownFade", "price": 8000}, {"color": "Sage", "lens": "RX", "price": 7600}]'::jsonb),

  ('frame_8', 'Paradox', array['MatteAnthracite', 'MatteGold', 'MatteOlive'], 
   '[{"color": "MatteAnthracite", "lens": "Orange", "price": 8900}, {"color": "MatteAnthracite", "lens": "Purple", "price": 8900}, {"color": "MatteAnthracite", "lens": "RX", "price": 8500}, {"color": "MatteGold", "lens": "Green", "price": 8900}, {"color": "MatteGold", "lens": "RX", "price": 8500}, {"color": "MatteOlive", "lens": "Brown", "price": 8900}, {"color": "MatteOlive", "lens": "RX", "price": 8500}]'::jsonb),

  ('frame_9', 'Portola', array['BlackCore', 'Black', 'Concrete', 'Havana', 'Olive'], 
   '[{"color": "BlackCore", "lens": "Black", "price": 7600}, {"color": "BlackCore", "lens": "RX", "price": 7200}, {"color": "Black", "lens": "Purple", "price": 7600}, {"color": "Black", "lens": "RX", "price": 7200}, {"color": "Concrete", "lens": "Peach", "price": 7600}, {"color": "Concrete", "lens": "RX", "price": 7200}, {"color": "Havana", "lens": "Brown", "price": 7600}, {"color": "Havana", "lens": "RX", "price": 7200}, {"color": "Olive", "lens": "Olive", "price": 7600}, {"color": "Olive", "lens": "RX", "price": 7200}]'::jsonb),

  ('frame_10', 'Prysm', array['BlackCore', 'Emerald', 'MatteBlack', 'MatteSmoke', 'Rust'], 
   '[{"color": "BlackCore", "lens": "Black", "price": 7600}, {"color": "BlackCore", "lens": "RX", "price": 7200}, {"color": "Emerald", "lens": "Black", "price": 7600}, {"color": "Emerald", "lens": "RX", "price": 7200}, {"color": "MatteBlack", "lens": "Orange", "price": 7600}, {"color": "MatteBlack", "lens": "RX", "price": 7200}, {"color": "MatteSmoke", "lens": "Purple", "price": 7600}, {"color": "MatteSmoke", "lens": "RX", "price": 7200}, {"color": "Rust", "lens": "Brown", "price": 7600}, {"color": "Rust", "lens": "RX", "price": 7200}]'::jsonb),

  ('frame_11', 'Runway', array['MatteGold', 'MatteGunmetal', 'Olive'], 
   '[{"color": "MatteGold", "lens": "Black", "price": 8600}, {"color": "MatteGold", "lens": "Green Fade", "price": 8600}, {"color": "MatteGold", "lens": "RX", "price": 8200}, {"color": "MatteGunmetal", "lens": "RX", "price": 8200}, {"color": "MatteGunmetal", "lens": "SkyBlue", "price": 8600}, {"color": "Olive", "lens": "Green", "price": 8600}, {"color": "Olive", "lens": "RX", "price": 8200}]'::jsonb),

  ('frame_12', 'Sheer', array['Gold', 'MatteBlack', 'Silver'], 
   '[{"color": "Gold", "lens": "Black", "price": 8600}, {"color": "Gold", "lens": "Olive", "price": 8600}, {"color": "Gold", "lens": "RX", "price": 7700}, {"color": "MatteBlack", "lens": "Green", "price": 8600}, {"color": "MatteBlack", "lens": "Rose", "price": 8600}, {"color": "MatteBlack", "lens": "RX", "price": 7700}, {"color": "Silver", "lens": "Black", "price": 8600}, {"color": "Silver", "lens": "RX", "price": 7700}]'::jsonb),

  ('frame_13', 'Slowburn', array['Black', 'Gold', 'Gunmetal'], 
   '[{"color": "Black", "lens": "BlackFade", "price": 8900}, {"color": "Black", "lens": "RX", "price": 8200}, {"color": "Gold", "lens": "BrownFade", "price": 8900}, {"color": "Gold", "lens": "RX", "price": 8200}, {"color": "Gunmetal", "lens": "GreenFade", "price": 8900}, {"color": "Gunmetal", "lens": "RX", "price": 8200}]'::jsonb),

  ('frame_14', 'Split', array['Gold', 'MatteBlack', 'MatteSilver'], 
   '[{"color": "Gold", "lens": "Black", "price": 8600}, {"color": "Gold", "lens": "Rose", "price": 8600}, {"color": "Gold", "lens": "RX", "price": 8200}, {"color": "MatteBlack", "lens": "Blue", "price": 8600}, {"color": "MatteBlack", "lens": "RX", "price": 8200}, {"color": "MatteBlack", "lens": "Yellow", "price": 8600}, {"color": "MatteSilver", "lens": "Blue", "price": 8600}, {"color": "MatteSilver", "lens": "RX", "price": 8200}]'::jsonb),

  ('frame_15', 'Strand', array['Black', 'BlackG', 'Havana', 'Olive', 'Wine'], 
   '[{"color": "Black", "lens": "Black", "price": 7600}, {"color": "BlackG", "lens": "Green", "price": 7600}, {"color": "BlackG", "lens": "RX", "price": 7200}, {"color": "Black", "lens": "RX", "price": 7200}, {"color": "Havana", "lens": "Peach", "price": 7600}, {"color": "Havana", "lens": "RX", "price": 7200}, {"color": "Olive", "lens": "Brown", "price": 7600}, {"color": "Olive", "lens": "RX", "price": 7200}, {"color": "Wine", "lens": "Black", "price": 7600}, {"color": "Wine", "lens": "RX", "price": 7200}]'::jsonb),

  ('frame_16', 'Strangelove', array['Anthracite', 'Gold', 'Silver'], 
   '[{"color": "Anthracite", "lens": "Orange", "price": 8900}, {"color": "Anthracite", "lens": "Purple", "price": 8900}, {"color": "Anthracite", "lens": "RX", "price": 8200}, {"color": "Gold", "lens": "Black", "price": 8900}, {"color": "Gold", "lens": "RX", "price": 8200}, {"color": "Silver", "lens": "Olive", "price": 8900}, {"color": "Silver", "lens": "RX", "price": 8200}]'::jsonb),

  ('frame_17', 'Undertone', array['Anthracite', 'Gold', 'Silver'], 
   '[{"color": "Anthracite", "lens": "Rose", "price": 9200}, {"color": "Anthracite", "lens": "RX", "price": 8800}, {"color": "Gold", "lens": "Black", "price": 9200}, {"color": "Gold", "lens": "RX", "price": 8800}, {"color": "Silver", "lens": "Green", "price": 9200}, {"color": "Silver", "lens": "RX", "price": 8800}]'::jsonb),

  ('frame_18', 'Vapour', array['BlackShell', 'BlackShellG', 'Emerald', 'Glass', 'Rust'], 
   '[{"color": "BlackShell", "lens": "Blue", "price": 7600}, {"color": "BlackShellG", "lens": "Black", "price": 7600}, {"color": "BlackShellG", "lens": "RX", "price": 7200}, {"color": "BlackShell", "lens": "RX", "price": 7200}, {"color": "Emerald", "lens": "Olive", "price": 7600}, {"color": "Emerald", "lens": "RX", "price": 7200}, {"color": "Glass", "lens": "GreenFade", "price": 7600}, {"color": "Glass", "lens": "RX", "price": 7200}, {"color": "Rust", "lens": "BrownFade", "price": 7600}, {"color": "Rust", "lens": "RX", "price": 7200}]'::jsonb),

  ('frame_19', 'Velo', array['Black', 'BlackShell', 'Cobalt', 'Ember', 'MatteBlack'], 
   '[{"color": "Black", "lens": "Black", "price": 7300}, {"color": "Black", "lens": "Purple", "price": 7300}, {"color": "BlackShell", "lens": "Black", "price": 7300}, {"color": "Cobalt", "lens": "Brown", "price": 7300}, {"color": "Ember", "lens": "Yellow", "price": 7300}, {"color": "MatteBlack", "lens": "Green", "price": 7300}]'::jsonb),

  ('frame_20', 'Vondel', array['Black', 'BlackShell', 'Champagne', 'Havana', 'Teal'], 
   '[{"color": "Black", "lens": "Black", "price": 7300}, {"color": "Black", "lens": "RX", "price": 6900}, {"color": "BlackShell", "lens": "Rose", "price": 7300}, {"color": "BlackShell", "lens": "RX", "price": 6900}, {"color": "Champagne", "lens": "Brown", "price": 7300}, {"color": "Champagne", "lens": "RX", "price": 6900}, {"color": "Havana", "lens": "Green", "price": 7300}, {"color": "Havana", "lens": "RX", "price": 6900}, {"color": "Teal", "lens": "RX", "price": 6900}, {"color": "Teal", "lens": "SkyBlue", "price": 7300}]'::jsonb),

  ('frame_21', 'Wireframe', array['Bronze', 'Gold', 'MatteBlack', 'Silver'], 
   '[{"color": "Bronze", "lens": "Blue", "price": 8600}, {"color": "Gold", "lens": "Orange", "price": 8600}, {"color": "MatteBlack", "lens": "BlackFade", "price": 8600}, {"color": "Silver", "lens": "Purple", "price": 8600}]'::jsonb)
on conflict (name) do update set
  colors = excluded.colors,
  variants = excluded.variants;
