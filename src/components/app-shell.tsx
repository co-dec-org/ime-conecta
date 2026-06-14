"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  FolderKanban,
  Handshake,
  Home,
  LinkIcon,
  LogOut,
  UserRound,
  Settings,
  UsersRound
} from "lucide-react";
import { APP_TAGLINE } from "@/lib/constants";
import type { AuthorizedUser } from "@/lib/types";
import { cn, fullName } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/directorio", label: "Directorio semanal", icon: CalendarDays },
  { href: "/proyectos", label: "Proyectos", icon: FolderKanban },
  { href: "/tareas", label: "Tareas", icon: ClipboardList },
  { href: "/reuniones", label: "Reuniones", icon: Handshake },
  { href: "/acuerdos", label: "Acuerdos", icon: FileText },
  { href: "/stakeholders", label: "Stakeholders", icon: UsersRound },
  { href: "/documentos", label: "Enlaces", icon: LinkIcon },
  { href: "/cuenta", label: "Mi cuenta", icon: UserRound },
  { href: "/accesos", label: "Accesos", icon: Settings }
];

export function AppShell({
  profile,
  children
}: {
  profile: AuthorizedUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-line bg-ink text-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 px-5 py-4 lg:block lg:px-6 lg:py-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">IME Chile A.G.</p>
            <h1 className="mt-1 text-2xl font-bold">IME Hub</h1>
          </div>
          <form action="/api/auth/logout" method="post" className="lg:hidden">
            <button className="focus-ring rounded-md p-2 text-white/80 hover:bg-white/10" title="Cerrar sesión" type="submit">
              <LogOut size={18} />
            </button>
          </form>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:grid lg:px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            if (item.href === "/accesos" && profile.global_role !== "admin") return null;
            return (
              <Link
                className={cn(
                  "focus-ring inline-flex min-h-10 shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/72 transition hover:bg-white/10 hover:text-white",
                  active && "bg-white text-ink hover:bg-white hover:text-ink"
                )}
                href={item.href}
                key={item.href}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden px-6 py-5 lg:block">
          <p className="text-sm leading-6 text-white/55">{APP_TAGLINE}</p>
          <div className="mt-8 rounded-lg border border-white/10 p-4">
            <p className="text-sm font-semibold">{fullName(profile)}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/45">{profile.global_role}</p>
            <form action="/api/auth/logout" method="post" className="mt-4">
              <button
                className="focus-ring inline-flex min-h-9 items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                title="Cerrar sesión"
                type="submit"
              >
                <LogOut size={16} />
                Salir
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
