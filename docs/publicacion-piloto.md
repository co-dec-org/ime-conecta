# Publicación Piloto IME Hub

## Estado Antes De Publicar

- MVP funcionando en local.
- Login simplificado con usuario personal y clave.
- Usuario piloto confirmado: `Patricio`.
- Supabase conectado.
- Dashboard, proyectos, tareas, accesos, enlaces y directorio semanal operativos.
- CSV de carga mínima preparado en `docs/carga-operativa-inicial.csv`.
- Repo privado publicado en GitHub: `https://github.com/co-dec-org/ime-hub`.
- Proyecto publicado en Vercel: `https://ime-hub.vercel.app`.

## Datos Mínimos Para Cerrar

Antes del deploy, completar en el CSV:

- Links reales a hilos Gmail.
- Links reales a carpetas Drive.
- Link a documento principal cuando exista.
- Responsable confirmado por directorio para cada proyecto.
- Fecha crítica o fecha de revisión para cada proyecto activo.

No es necesario tener toda la historia documental cargada. Para el piloto basta con que cada proyecto activo tenga responsable, próximo paso, fecha y al menos un respaldo.

## Seguridad

Antes de publicar, rotar la `SUPABASE_SERVICE_ROLE_KEY` porque fue usada durante la configuración local.

Pasos:

1. En Supabase, abrir Project Settings.
2. Entrar a API Keys.
3. Crear o regenerar una secret key.
4. Actualizar `.env.local` para desarrollo.
5. Usar la nueva key en las variables de entorno de Vercel.
6. No pegar la secret key en chat, documentos ni repositorio.

## Variables De Entorno En Vercel

Configurar:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=https://imehub.orionnetwork.cl
```

Variables cargadas en Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

## Dominio Piloto

Dominio agregado en Vercel:

```text
imehub.orionnetwork.cl
```

Estado actual: DNS y HTTPS activos.

Registro creado en cPanel para `orionnetwork.cl`:

```text
Tipo: CNAME
Nombre: imehub
Valor: c190b7f1892a996a.vercel-dns-017.com.
```

Verificado el 31 de mayo de 2026:

- `https://imehub.orionnetwork.cl/login` responde `HTTP/2 200`.
- `POST /api/auth/password-login` responde `{"ok": true}` para el usuario piloto.

## Supabase Auth

En Supabase, confirmar:

- Email/Password activo.
- Auto-registro público desactivado.
- URL permitida: `https://imehub.orionnetwork.cl`.
- URL local permitida: `http://127.0.0.1:3000`.

## Verificación Técnica

Ejecutar antes de subir:

```bash
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev
```

## Prueba Piloto

Después del deploy:

1. Entrar a `https://imehub.orionnetwork.cl`.
2. Iniciar sesión con usuario `Patricio`.
3. Cambiar clave desde **Mi cuenta**.
4. Abrir **Dashboard**.
5. Abrir **Directorio semanal**.
6. Abrir **Proyectos** y editar un proyecto.
7. Pegar un link real de Gmail o Drive en **Enlaces**.
8. Confirmar que **Accesos** permite resetear clave inicial.

## Criterio De Salida

Publicar el piloto cuando:

- Patricio pueda entrar con clave cambiada.
- Al menos 3 proyectos tengan responsable, próximo paso, fecha y link real.
- El directorio semanal muestre tareas o decisiones útiles.
- La secret key antigua ya no sea válida.
