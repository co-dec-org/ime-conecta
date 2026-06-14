"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";

export function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmation) {
      setMessage("Las claves no coinciden.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    const payload = (await response.json().catch(() => ({}))) as { message?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(payload.message ?? "No pudimos cambiar la clave.");
      return;
    }

    setPassword("");
    setConfirmation("");
    setMessage("Clave actualizada.");
  }

  return (
    <form className="grid gap-4" onSubmit={changePassword}>
      <label className="grid gap-1 text-sm font-medium text-ink">
        <span>Nueva clave</span>
        <input
          autoComplete="new-password"
          className="focus-ring min-h-10 rounded-md border border-line bg-white px-3 py-2 text-sm"
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-ink">
        <span>Confirmar nueva clave</span>
        <input
          autoComplete="new-password"
          className="focus-ring min-h-10 rounded-md border border-line bg-white px-3 py-2 text-sm"
          minLength={8}
          onChange={(event) => setConfirmation(event.target.value)}
          required
          type="password"
          value={confirmation}
        />
      </label>
      <button
        className="focus-ring inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        <KeyRound size={17} />
        Cambiar clave
      </button>
      {message ? <p className="text-sm text-ink/65">{message}</p> : null}
    </form>
  );
}
