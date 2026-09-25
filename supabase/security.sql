-- ============================================================================
-- SECURITY: ADMIN-ONLY EDITS + PIN-PROTECTED PLAYER PROFILES
-- ============================================================================
--
-- Replaces the original "anyone can do anything" policies.
--
--   Everyone (anon key)   view everything, submit times,
--                         create a player profile (via create_player),
--                         edit THEIR OWN profile with its PIN (via update_player_profile)
--   Admin (signed in)     everything: edit/delete scores, players, games, modes, tracks
--
-- The anon key ships in the web app, so these rules are the real protection;
-- the in-app admin PIN is only a convenience lock.
--
-- SETUP
--   1. Supabase Dashboard -> Authentication -> Users -> Add user
--      (email + password, tick "Auto Confirm User"). This is your admin login.
--   2. Run this whole file in the SQL Editor.
--   3. Make that user an admin (replace the email):
--        insert into public.admins (user_id)
--        select id from auth.users where email = 'you@example.com';
--
-- Safe to re-run. The RESTORE section at the bottom returns to open policies.
-- ============================================================================

create extension if not exists pgcrypto with schema extensions;


-- ============================================================================
-- ADMINS
-- ============================================================================

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
-- No policies: nobody reads or writes this through the API.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;


-- ============================================================================
-- PLAYER PINS (never readable through the API)
-- ============================================================================

create table if not exists public.player_secrets (
  player_id uuid primary key references public.players (id) on delete cascade,
  pin_hash text not null,
  failed_attempts integer not null default 0,
  locked_until timestamptz
);

alter table public.player_secrets enable row level security;
-- No policies: only the security definer functions below touch it.


-- ============================================================================
-- POLICIES
-- ============================================================================

-- Drop the original open write policies (SELECT policies stay)
drop policy if exists "Anyone can create players"  on public.players;
drop policy if exists "Anyone can update players"  on public.players;
drop policy if exists "Anyone can delete players"  on public.players;
drop policy if exists "Anyone can create games"    on public.games;
drop policy if exists "Anyone can update games"    on public.games;
drop policy if exists "Anyone can delete games"    on public.games;
drop policy if exists "Anyone can create modes"    on public.game_modes;
drop policy if exists "Anyone can update modes"    on public.game_modes;
drop policy if exists "Anyone can delete modes"    on public.game_modes;
drop policy if exists "Anyone can create details"  on public.game_details;
drop policy if exists "Anyone can update details"  on public.game_details;
drop policy if exists "Anyone can delete details"  on public.game_details;
drop policy if exists "Anyone can update scores"   on public.high_scores;
drop policy if exists "Anyone can delete scores"   on public.high_scores;
-- Kept: "Anyone can submit scores" (INSERT on high_scores) and all "Anyone can view" policies

-- Admin can do everything
drop policy if exists "Admins manage players"  on public.players;
drop policy if exists "Admins manage games"    on public.games;
drop policy if exists "Admins manage modes"    on public.game_modes;
drop policy if exists "Admins manage details"  on public.game_details;
drop policy if exists "Admins manage scores"   on public.high_scores;

create policy "Admins manage players"  on public.players      for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage games"    on public.games        for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage modes"    on public.game_modes   for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage details"  on public.game_details for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage scores"   on public.high_scores  for all to authenticated using (public.is_admin()) with check (public.is_admin());


-- ============================================================================
-- VALIDATION HELPERS
-- ============================================================================

create or replace function public.clean_player_name(p_name text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_name text := btrim(coalesce(p_name, ''));
begin
  if char_length(v_name) < 1 or char_length(v_name) > 30 then
    raise exception 'Name must be 1-30 characters' using errcode = '22023';
  end if;
  return v_name;
end;
$$;

-- Guests may only use spookicons (no arbitrary image URLs)
create or replace function public.check_guest_avatar(p_avatar_url text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_avatar_url is not null and p_avatar_url !~ '^spookicon:[a-z]{1,20}$' then
    raise exception 'Invalid avatar' using errcode = '22023';
  end if;
  return p_avatar_url;
end;
$$;


-- ============================================================================
-- create_player: anyone can create a profile, optionally with a 4-digit PIN
-- ============================================================================

create or replace function public.create_player(
  p_name text,
  p_avatar_url text default null,
  p_pin text default null
)
returns public.players
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_player public.players;
begin
  if p_pin is not null and p_pin !~ '^[0-9]{4}$' then
    raise exception 'PIN must be 4 digits' using errcode = '22023';
  end if;

  insert into public.players (name, avatar_url)
  values (public.clean_player_name(p_name), public.check_guest_avatar(p_avatar_url))
  returning * into v_player;

  if p_pin is not null then
    insert into public.player_secrets (player_id, pin_hash)
    values (v_player.id, extensions.crypt(p_pin, extensions.gen_salt('bf')));
  end if;

  return v_player;
end;
$$;

grant execute on function public.create_player(text, text, text) to anon, authenticated;


-- ============================================================================
-- player_has_pin: lets the app say "no PIN, ask the host" before asking for one
-- ============================================================================

create or replace function public.player_has_pin(p_player_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.player_secrets where player_id = p_player_id);
$$;

grant execute on function public.player_has_pin(uuid) to anon, authenticated;


-- ============================================================================
-- update_player_profile: edit your own profile with its PIN
--
-- Pass only p_player_id + p_pin to just check the PIN.
-- Returns jsonb { ok, error?, attempts_left?, locked_until?, player? }
-- instead of raising, so failed attempts are counted (a raise would roll back).
-- 5 wrong PINs lock the profile for 15 minutes.
-- ============================================================================

create or replace function public.update_player_profile(
  p_player_id uuid,
  p_pin text,
  p_name text default null,
  p_avatar_url text default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_secret public.player_secrets;
  v_player public.players;
  max_attempts constant integer := 5;
begin
  select * into v_secret from public.player_secrets where player_id = p_player_id for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'no_pin');
  end if;

  if v_secret.locked_until is not null and v_secret.locked_until > now() then
    return jsonb_build_object('ok', false, 'error', 'locked', 'locked_until', v_secret.locked_until);
  end if;

  if p_pin is null or v_secret.pin_hash <> extensions.crypt(p_pin, v_secret.pin_hash) then
    if v_secret.failed_attempts + 1 >= max_attempts then
      update public.player_secrets
        set failed_attempts = 0, locked_until = now() + interval '15 minutes'
        where player_id = p_player_id;
      return jsonb_build_object('ok', false, 'error', 'locked', 'locked_until', now() + interval '15 minutes');
    end if;

    update public.player_secrets
      set failed_attempts = v_secret.failed_attempts + 1
      where player_id = p_player_id;
    return jsonb_build_object('ok', false, 'error', 'wrong_pin',
      'attempts_left', max_attempts - v_secret.failed_attempts - 1);
  end if;

  update public.player_secrets set failed_attempts = 0, locked_until = null where player_id = p_player_id;

  update public.players
    set name = case when p_name is null then name else public.clean_player_name(p_name) end,
        avatar_url = case when p_avatar_url is null then avatar_url else public.check_guest_avatar(p_avatar_url) end
    where id = p_player_id
    returning * into v_player;

  return jsonb_build_object('ok', true, 'player', to_jsonb(v_player));
end;
$$;

grant execute on function public.update_player_profile(uuid, text, text, text) to anon, authenticated;


-- ============================================================================
-- set_player_pin: admin sets or resets a player's PIN (forgotten PINs,
-- or giving an existing game room player a PIN)
-- ============================================================================

create or replace function public.set_player_pin(p_player_id uuid, p_pin text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin only' using errcode = '42501';
  end if;
  if p_pin !~ '^[0-9]{4}$' then
    raise exception 'PIN must be 4 digits' using errcode = '22023';
  end if;

  insert into public.player_secrets (player_id, pin_hash)
  values (p_player_id, extensions.crypt(p_pin, extensions.gen_salt('bf')))
  on conflict (player_id) do update
    set pin_hash = excluded.pin_hash, failed_attempts = 0, locked_until = null;
end;
$$;

grant execute on function public.set_player_pin(uuid, text) to authenticated;


-- ============================================================================
-- RESTORE (return to the original open policies; run only if needed)
-- ============================================================================
--
-- drop policy if exists "Admins manage players"  on public.players;
-- drop policy if exists "Admins manage games"    on public.games;
-- drop policy if exists "Admins manage modes"    on public.game_modes;
-- drop policy if exists "Admins manage details"  on public.game_details;
-- drop policy if exists "Admins manage scores"   on public.high_scores;
-- create policy "Anyone can create players" on public.players      for insert with check (true);
-- create policy "Anyone can update players" on public.players      for update using (true);
-- create policy "Anyone can delete players" on public.players      for delete using (true);
-- create policy "Anyone can create games"   on public.games        for insert with check (true);
-- create policy "Anyone can update games"   on public.games        for update using (true);
-- create policy "Anyone can delete games"   on public.games        for delete using (true);
-- create policy "Anyone can create modes"   on public.game_modes   for insert with check (true);
-- create policy "Anyone can update modes"   on public.game_modes   for update using (true);
-- create policy "Anyone can delete modes"   on public.game_modes   for delete using (true);
-- create policy "Anyone can create details" on public.game_details for insert with check (true);
-- create policy "Anyone can update details" on public.game_details for update using (true);
-- create policy "Anyone can delete details" on public.game_details for delete using (true);
-- create policy "Anyone can update scores"  on public.high_scores  for update using (true);
-- create policy "Anyone can delete scores"  on public.high_scores  for delete using (true);
