import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Verde: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  Amarillo: "bg-amber-50 text-amber-800 ring-amber-200",
  Rojo: "bg-red-50 text-red-800 ring-red-200",
  Gris: "bg-stone-100 text-stone-700 ring-stone-200",
  Alta: "bg-berry/10 text-berry ring-berry/20",
  Media: "bg-gold/10 text-gold ring-gold/30",
  Baja: "bg-forest/10 text-forest ring-forest/20",
  Bloqueado: "bg-red-50 text-red-800 ring-red-200",
  Bloqueada: "bg-red-50 text-red-800 ring-red-200",
  Vencida: "bg-red-50 text-red-800 ring-red-200",
  Pendiente: "bg-amber-50 text-amber-800 ring-amber-200",
  Terminada: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  Activo: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  activo: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  suspendido: "bg-amber-50 text-amber-800 ring-amber-200",
  revocado: "bg-red-50 text-red-800 ring-red-200"
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        statusStyles[value] ?? "bg-stone-100 text-stone-700 ring-stone-200",
        className
      )}
    >
      {value}
    </span>
  );
}
