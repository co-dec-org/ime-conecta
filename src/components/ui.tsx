import { cn } from "@/lib/utils";

export function Panel({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-line bg-white p-5 shadow-panel", className)}>
      {children}
    </section>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
  placeholder
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium text-ink">
      <span>{label}</span>
      <input
        className="focus-ring min-h-10 rounded-md border border-line bg-white px-3 py-2 text-sm"
        name={name}
        defaultValue={defaultValue ?? ""}
        type={type}
        required={required}
        placeholder={placeholder}
      />
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 3,
  required = false
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium text-ink">
      <span>{label}</span>
      <textarea
        className="focus-ring rounded-md border border-line bg-white px-3 py-2 text-sm"
        name={name}
        defaultValue={defaultValue ?? ""}
        rows={rows}
        required={required}
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  options,
  defaultValue,
  required = false,
  includeEmpty = false
}: {
  label: string;
  name: string;
  options: readonly string[] | { label: string; value: string }[];
  defaultValue?: string | null;
  required?: boolean;
  includeEmpty?: boolean;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium text-ink">
      <span>{label}</span>
      <select
        className="focus-ring min-h-10 rounded-md border border-line bg-white px-3 py-2 text-sm"
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
      >
        {includeEmpty ? <option value="">Sin asignar</option> : null}
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const labelText = typeof option === "string" ? option : option.label;
          return (
            <option key={value} value={value}>
              {labelText}
            </option>
          );
        })}
      </select>
    </label>
  );
}

export function SubmitButton({ children = "Guardar" }: { children?: React.ReactNode }) {
  return (
    <button
      className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-forest/90"
      type="submit"
    >
      {children}
    </button>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white/70 p-6 text-sm text-ink/65">
      {children}
    </div>
  );
}
