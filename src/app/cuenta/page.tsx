import { AppShell } from "@/components/app-shell";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { Panel } from "@/components/ui";
import { requireProfile } from "@/lib/auth";
import { formatDateTime } from "@/lib/date";
import { fullName } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { profile } = await requireProfile();

  return (
    <AppShell profile={profile}>
      <div className="grid max-w-3xl gap-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-forest">Cuenta</p>
          <h2 className="mt-1 text-3xl font-bold text-ink">Mi cuenta</h2>
        </header>

        <Panel>
          <h3 className="text-lg font-bold">Datos de acceso</h3>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="grid gap-1 sm:grid-cols-[180px_1fr]">
              <dt className="font-semibold text-ink/60">Nombre</dt>
              <dd>{fullName(profile)}</dd>
            </div>
            <div className="grid gap-1 sm:grid-cols-[180px_1fr]">
              <dt className="font-semibold text-ink/60">Usuario</dt>
              <dd>{profile.first_name}</dd>
            </div>
            <div className="grid gap-1 sm:grid-cols-[180px_1fr]">
              <dt className="font-semibold text-ink/60">Correo registrado</dt>
              <dd>{profile.email}</dd>
            </div>
            <div className="grid gap-1 sm:grid-cols-[180px_1fr]">
              <dt className="font-semibold text-ink/60">Último acceso</dt>
              <dd>{formatDateTime(profile.last_active_at)}</dd>
            </div>
          </dl>
        </Panel>

        <Panel>
          <h3 className="text-lg font-bold">Cambiar clave</h3>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            Puedes mantener tu clave inicial o cambiarla cuando quieras. Usa al menos 8 caracteres.
          </p>
          <div className="mt-5">
            <ChangePasswordForm />
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
