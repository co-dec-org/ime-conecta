# Checklist Piloto IME Hub

## Accesos

- Rotar `SUPABASE_SERVICE_ROLE_KEY` en Supabase y actualizar Vercel/local.
- Confirmar usuarios iniciales.
- Restablecer clave inicial para cada usuario desde **Accesos** si es necesario.
- Probar al menos un usuario Admin, un Director/a y un Socix.

## Carga Operativa

Completar para cada proyecto activo:

- Responsable principal.
- Próximo paso.
- Fecha crítica o fecha de revisión.
- Link a hilo Gmail, carpeta Drive o documento principal.

Usar `docs/carga-operativa-inicial.csv` como pauta de carga. La base inicial ya incluye estado, prioridad y próximos pasos propuestos; faltan los links reales y las confirmaciones de directorio.

## Revisión De Permisos

- Confirmar que Socix no ve proyectos reservados o sensibles.
- Confirmar que Socix no ve links Gmail/Drive salvo proyectos visibles para socixs.
- Confirmar que RUT y teléfono solo aparecen en Accesos para Admin.

## Antes Del Deploy

- [x] Ejecutar `npm run lint`.
- [x] Ejecutar `npm run typecheck`.
- [x] Ejecutar `npm run build`.
- [x] Ejecutar `npm audit --omit=dev`.
- [x] Revisar variables de entorno en Vercel.
- [x] Seguir `docs/publicacion-piloto.md`.
- [x] Publicar `https://imehub.orionnetwork.cl`.
