type ThemeToggleProps = {
  theme: "dark" | "light";
  onToggle: () => void;
};

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isLight = theme === "light";

  return (
    <button
      className="toolbar-button compact"
      type="button"
      onClick={onToggle}
      aria-label={isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
      title={isLight ? "Modo oscuro" : "Modo claro"}
    >
      <span aria-hidden="true">{isLight ? "D" : "C"}</span>
      <span>{isLight ? "Oscuro" : "Claro"}</span>
    </button>
  );
}
