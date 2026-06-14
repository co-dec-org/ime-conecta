"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, UserRound } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const reason = searchParams.get("reason");
  const reasonMessage = useMemo(() => {
    if (reason === "revalidate" || reason === "session") return "Por seguridad, vuelve a iniciar sesión.";
    if (reason === "inactive") return "Tu acceso no está activo.";
    return null;
  }, [reason]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/auth/password-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { message?: string };
      setMessage(payload.message ?? "Usuario o clave inválidos.");
      setLoading(false);
      return;
    }

    router.replace("/");
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-8">
      <div className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-forest">Acceso privado</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">IME Hub</h1>
        <p className="mt-3 text-sm leading-6 text-ink/65">
          Ingresa con tu usuario personal y clave. La clave inicial es tu correo registrado.
        </p>

        {reasonMessage ? (
          <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {reasonMessage}
          </div>
        ) : null}

        <form className="mt-6 grid gap-4" onSubmit={login}>
          <label className="grid gap-1 text-sm font-medium text-ink">
            <span>Usuario</span>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/45" size={18} />
              <input
                autoComplete="username"
                className="focus-ring min-h-11 w-full rounded-md border border-line bg-white py-2 pl-10 pr-3 text-sm"
                onChange={(event) => setUsername(event.target.value)}
                required
                value={username}
              />
            </div>
          </label>
          <label className="grid gap-1 text-sm font-medium text-ink">
            <span>Clave</span>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/45" size={18} />
              <input
                autoComplete="current-password"
                className="focus-ring min-h-11 w-full rounded-md border border-line bg-white py-2 pl-10 pr-3 text-sm"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </div>
          </label>
          <button
            className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            <KeyRound size={17} />
            Entrar
          </button>
        </form>

        {message ? <p className="mt-4 text-sm text-ink/65">{message}</p> : null}
      </div>
    </div>
  );
}
