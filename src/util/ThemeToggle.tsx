import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useTheme, type Theme } from "./Theme";

const options: { value: Theme; label: string; Icon: LucideIcon }[] = [
  { value: "light", label: "Light mode", Icon: Sun },
  { value: "system", label: "System mode", Icon: Monitor },
  { value: "dark", label: "Dark mode", Icon: Moon },
];

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Theme"
      className="flex items-center rounded-full border border-outline bg-surface-container p-1 shadow-md"
    >
      {options.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          aria-label={label}
          aria-pressed={theme === value}
          className={`rounded-full p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 motion-reduce:transition-none ${
            theme === value
              ? "bg-primary text-on-primary"
              : "text-on-surface-variant hover:bg-surface-variant"
          }`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;