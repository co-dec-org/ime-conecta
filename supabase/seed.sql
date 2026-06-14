update public.authorized_users
set email = 'co.dec.org@gmail.com',
    login_username = 'Patricio',
    rut = '129977388'
where lower(email) = 'pagc@hotmail.com';

insert into public.authorized_users
  (first_name, last_name, login_username, rut, email, phone, position, global_role, status, can_view_sensitive_data)
values
  ('Ignacia', 'Muñoz', 'Ignacia', null, 'ignacia.munoz@mail.udp.cl', null, 'Presidenta', 'director', 'activo', false),
  ('Max', 'Johnson', 'Max', null, 'max.johnson.la@gmail.com', null, 'Vicepresidente', 'director', 'activo', false),
  ('Fran', 'Bakovic', 'Fran', null, 'franbakovic@gmail.com', null, 'Secretaria', 'director', 'activo', false),
  ('Patricio', 'González Cruz', 'Patricio', '129977388', 'co.dec.org@gmail.com', null, 'Tesorero', 'admin', 'activo', true),
  ('Teko', 'Pamies', 'Teko', null, 'tekopamies@gmail.com', null, 'Director', 'director', 'activo', false),
  ('Josefa', 'Mujica', 'Josefa', null, 'mujicajf1@gmail.com', null, 'Directora', 'director', 'activo', false),
  ('Javier', 'González', 'Javier', null, 'jgonzaler@uc.cl', null, 'Director', 'director', 'activo', false),
  ('Pía', 'Cerda', 'Pia', null, 'pia.alejandra.cerda@gmail.com', null, 'Socia IME, no directora', 'socix', 'activo', false)
on conflict (email) do update set
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  login_username = excluded.login_username,
  rut = excluded.rut,
  position = excluded.position,
  global_role = excluded.global_role,
  status = excluded.status,
  can_view_sensitive_data = excluded.can_view_sensitive_data;

insert into public.projects
  (name, strategic_line, status, priority, record_type, traffic_light, institutional_mandate, confidentiality_level, socix_visibility, document_backing_type)
values
  ('Fortalecimiento Gremial Sercotec RM 2026', 'Fortalecimiento gremial', 'Postulación', 'Alta', 'Proyecto', 'Amarillo', null, 'Interna directorio', 'No visible', null),
  ('Certificación DJ ChileValora', 'Certificación / ChileValora', 'Activo', 'Alta', 'Proyecto', 'Amarillo', null, 'Interna directorio', 'Visible con hitos generales', null),
  ('Cooperativa de Servicios Culturales', 'Cooperativa / asociatividad', 'En evaluación', 'Media', 'Proyecto', 'Gris', 'En revisión por directorio', 'Interna directorio', 'No visible', null),
  ('Chile Creativo / Proyecto de Ley', 'Legislación / política pública', 'En evaluación', 'Media', 'Ruta estratégica', 'Gris', null, 'Interna directorio', 'No visible', null),
  ('Internacionalización Frankfurt 2027', 'Internacionalización', 'Idea', 'Media', 'Oportunidad', 'Gris', null, 'Interna directorio', 'No visible', null),
  ('Biobío Economía Creativa', 'Polos regionales', 'En evaluación', 'Media', 'Relación institucional', 'Gris', null, 'Interna directorio', 'No visible', null),
  ('Polos Regionales IME', 'Polos regionales', 'Activo', 'Media', 'Proyecto', 'Amarillo', null, 'Interna directorio', 'Visible como resumen', null),
  ('Planificación Directorio 2026', 'Administración interna', 'Activo', 'Alta', 'Proceso interno', 'Amarillo', null, 'Interna directorio', 'No visible', null)
on conflict do nothing;

insert into public.project_memberships (user_id, project_id, role, committee_profile_name)
select u.id, p.id, 'comite', 'Comite_TrabajoCultural_ChileValora'
from public.authorized_users u
cross join public.projects p
where lower(u.email) = 'pia.alejandra.cerda@gmail.com'
  and p.name = 'Certificación DJ ChileValora'
on conflict (user_id, project_id, role) do update set
  committee_profile_name = excluded.committee_profile_name;
