# IME Hub

IME Hub permite saber en qué va cada proyecto, quién lo lleva, qué falta y dónde está el respaldo documental.

MVP privado para IME Chile A.G. orientado a proyectos gremiales, tareas, reuniones externas, acuerdos, stakeholders, enlaces Gmail/Drive y bitácora operativa. La app guarda metadata operativa; Gmail y Drive siguen siendo el archivo documental oficial.

## Stack

- Next.js 16, App Router, TypeScript
- Tailwind CSS
- Supabase Auth con email/password
- Supabase Postgres con RLS
- Vercel

## Instalación local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Completa `.env.local` con las credenciales de Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

No subas `.env.local` al repositorio.

## Configuración Supabase

1. Crea un proyecto Supabase.
2. En SQL Editor ejecuta `supabase/schema.sql`.
3. Luego ejecuta `supabase/seed.sql`.
4. En Authentication activa Email/Password.
5. Desactiva auto-registro público desde el cliente. El MVP usa `/api/auth/password-login`, que revisa `authorized_users` activo por nombre personal antes de iniciar sesión.
6. Agrega los dominios autorizados:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
   - `https://imehub.orionnetwork.cl`
   - `https://hub.imechile.org`

## Seguridad y permisos

- Login obligatorio.
- Acceso mediante usuario personal y clave. En este MVP, el usuario personal corresponde al nombre registrado.
- La clave inicial es el correo registrado del usuario.
- El usuario puede cambiar su clave en **Mi cuenta**.
- Reingreso requerido si el usuario pasa 5 días sin actividad.
- RLS activado en tablas operativas.
- Vista `public_profiles` expone solo datos básicos para responsables.
- RUT y teléfono/WhatsApp se gestionan desde `authorized_users` y la UI de accesos es solo Admin.
- `robots.txt` y `X-Robots-Tag` impiden indexación.

## Claves iniciales

La clave inicial de cada usuario es su correo registrado. Desde **Accesos**, un Admin puede usar **Clave inicial** para restablecer esa clave temporal si alguien queda bloqueado. Cada usuario puede cambiar su clave en **Mi cuenta**.

## Módulos incluidos

- Dashboard general
- Directorio semanal
- CRUD de proyectos
- CRUD de tareas
- Reuniones externas
- Acuerdos
- Stakeholders
- Enlaces documentales manuales Gmail/Drive/web
- Accesos y perfiles
- Bitácora de actividad
- Exportación CSV de proyectos

## Despliegue en Vercel

1. Sube el repositorio a GitHub.
2. Importa el repo en Vercel.
3. Configura las variables de entorno de producción:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL=https://imehub.orionnetwork.cl`
4. Despliega.
5. En Supabase Authentication agrega `https://imehub.orionnetwork.cl` como URL permitida.

## Dominio piloto

En Vercel, agrega `imehub.orionnetwork.cl` al proyecto. Luego crea el registro DNS indicado por Vercel en la zona DNS de `orionnetwork.cl`.

## Dominio futuro

Cuando corresponda migrar a `hub.imechile.org`:

1. Agrega `hub.imechile.org` como dominio en Vercel.
2. Actualiza DNS de `imechile.org` con el registro indicado.
3. Cambia `NEXT_PUBLIC_APP_URL` a `https://hub.imechile.org`.
4. Agrega ese dominio en Supabase Authentication URL Configuration.

## Uso no técnico

1. Entra al dominio de IME Hub.
2. Escribe tu usuario personal.
3. Usa tu correo registrado como clave inicial.
4. Puedes cambiar la clave en **Mi cuenta**.
5. Usa Dashboard para ver alertas generales.
6. Usa Directorio semanal antes de reuniones de directorio.
7. En Proyectos, abre una ficha y actualiza responsable, próximo paso, fechas críticas y links Gmail/Drive.
8. En Tareas, marca avances y cierres.
9. En Enlaces, pega links a Gmail, Drive o documentos externos. No se suben archivos.

## Preparación del piloto

Usa [docs/carga-operativa-inicial.csv](docs/carga-operativa-inicial.csv) para reunir los datos mínimos de los proyectos antes de una carga real. El checklist operativo está en [docs/checklist-piloto.md](docs/checklist-piloto.md) y la guía de publicación está en [docs/publicacion-piloto.md](docs/publicacion-piloto.md).

## Verificación local realizada

```bash
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev
```

Resultado: lint OK, typecheck OK, build OK y audit sin vulnerabilidades.
