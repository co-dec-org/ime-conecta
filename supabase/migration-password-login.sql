alter table public.authorized_users
  add column if not exists login_username text,
  add column if not exists password_changed_at timestamptz;

create unique index if not exists authorized_users_login_username_lower_idx
  on public.authorized_users (lower(login_username))
  where login_username is not null;

update public.authorized_users
set login_username = first_name
where login_username is null;

update public.authorized_users
set login_username = 'Patricio',
    rut = '129977388',
    email = 'co.dec.org@gmail.com',
    force_revalidation = false
where lower(email) in ('co.dec.org@gmail.com', 'pagc@hotmail.com')
   or rut = '129977388';
