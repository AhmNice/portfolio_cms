import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  ChevronRight,
  CircleUserRound,
  KeyRound,
  LogOut,
  Monitor,
  Moon,
  Palette,
  ShieldCheck,
  Sun,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import MainLayout from "../layout/MainLayout";
import { useAuthStore } from "../store/auth.store";
import { useTheme, type Theme } from "../util/Theme";

const PREFERENCES_KEY = "portfolio-cms-preferences";

interface Preferences {
  emailNotifications: boolean;
  autosaveDrafts: boolean;
}

const defaultPreferences: Preferences = {
  emailNotifications: true,
  autosaveDrafts: true,
};

const themeOptions: { value: Theme; label: string; description: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", description: "A bright editorial workspace", icon: Sun },
  { value: "system", label: "System", description: "Follow your device preference", icon: Monitor },
  { value: "dark", label: "Dark", description: "A softer workspace for low light", icon: Moon },
];

const readPreferences = (): Preferences => {
  try {
    const stored = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || "null");
    return { ...defaultPreferences, ...(stored || {}) };
  } catch {
    return defaultPreferences;
  }
};

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setPreferences(readPreferences());
  }, []);

  const updatePreference = (key: keyof Preferences) => {
    setPreferences((current) => {
      const next = { ...current, [key]: !current[key] };
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const response = await logout();
    if (response.success) {
      navigate("/", { replace: true });
    } else {
      toast.error(response.message || "Unable to sign out");
      setIsLoggingOut(false);
    }
  };

  const displayName = user?.name || "Portfolio owner";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">
        <section className="relative overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-7 sm:px-8">
          <div className="pointer-events-none absolute -right-10 -top-20 h-48 w-48 rounded-full border-[24px] border-primary/10" />
          <div className="relative max-w-2xl">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
              <Palette size={13} />
              Workspace preferences
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
              Make the studio yours.
            </h2>
            <p className="mt-3 font-body text-sm leading-relaxed text-on-surface-variant sm:text-base">
              Tune the workspace around how you write, publish, and keep in touch.
            </p>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CircleUserRound size={19} />
                </span>
                <div>
                  <h3 className="font-heading text-xl font-bold text-on-surface">Account</h3>
                  <p className="mt-1 font-body text-sm text-on-surface-variant">Your authenticated profile details.</p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4 rounded-lg bg-surface-container-low p-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-container font-heading font-bold text-on-primary-container">
                  {initials || "P"}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-heading font-semibold text-on-surface">{displayName}</p>
                  <p className="truncate font-body text-sm text-on-surface-variant">{user?.email || "No email available"}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-outline-variant/15 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">Account status</p>
                  <p className="mt-2 flex items-center gap-2 font-body text-sm font-medium text-on-surface">
                    <span className="h-2 w-2 rounded-full bg-primary" /> Active
                  </p>
                </div>
                <div className="rounded-lg border border-outline-variant/15 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">Security</p>
                  <p className="mt-2 flex items-center gap-2 font-body text-sm font-medium text-on-surface">
                    <ShieldCheck size={15} className="text-primary" /> Protected session
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-outline-variant/15 pt-5">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="inline-flex items-center gap-2 rounded-lg border border-error/30 px-3 py-2 font-body text-sm font-medium text-error transition hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LogOut size={16} />
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </section>

            <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Bell size={19} />
                </span>
                <div>
                  <h3 className="font-heading text-xl font-bold text-on-surface">Notifications</h3>
                  <p className="mt-1 font-body text-sm text-on-surface-variant">Choose which local workspace reminders are active.</p>
                </div>
              </div>
              <div className="mt-6 divide-y divide-outline-variant/15">
                <PreferenceRow
                  label="Email notifications"
                  description="Keep notifications enabled for new portfolio enquiries."
                  checked={preferences.emailNotifications}
                  onChange={() => updatePreference("emailNotifications")}
                />
                <PreferenceRow
                  label="Autosave drafts"
                  description="Remember your editor preference on this device."
                  checked={preferences.autosaveDrafts}
                  onChange={() => updatePreference("autosaveDrafts")}
                />
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tertiary/10 text-tertiary">
                  <Palette size={19} />
                </span>
                <div>
                  <h3 className="font-heading text-xl font-bold text-on-surface">Appearance</h3>
                  <p className="mt-1 font-body text-sm text-on-surface-variant">Set the visual mode for your workspace.</p>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                {themeOptions.map(({ value, label, description, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTheme(value)}
                    aria-pressed={theme === value}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${theme === value ? "border-primary/50 bg-primary/10" : "border-outline-variant/15 hover:border-outline-variant/40 hover:bg-surface-container-low"}`}
                  >
                    <Icon size={17} className={theme === value ? "text-primary" : "text-on-surface-variant"} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-body text-sm font-semibold text-on-surface">{label}</span>
                      <span className="mt-0.5 block font-body text-xs text-on-surface-variant">{description}</span>
                    </span>
                    {theme === value && <Check size={16} className="text-primary" />}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <KeyRound size={19} />
                </span>
                <div>
                  <h3 className="font-heading text-xl font-bold text-on-surface">Security</h3>
                  <p className="mt-1 font-body text-sm text-on-surface-variant">Manage access to your CMS account.</p>
                </div>
              </div>
              <div className="mt-6 rounded-lg bg-surface-container-low p-4">
                <p className="font-body text-sm leading-relaxed text-on-surface-variant">
                  Password recovery is handled from the secure sign-in flow. Sign out before switching accounts on a shared device.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/auth/login")}
                  className="mt-4 inline-flex items-center gap-1.5 font-body text-sm font-semibold text-primary hover:underline"
                >
                  Open sign-in flow <ChevronRight size={15} />
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

interface PreferenceRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

const PreferenceRow = ({ label, description, checked, onChange }: PreferenceRowProps) => (
  <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
    <div className="min-w-0 flex-1">
      <p className="font-body text-sm font-semibold text-on-surface">{label}</p>
      <p className="mt-1 font-body text-xs leading-relaxed text-on-surface-variant">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 ${checked ? "bg-primary" : "bg-outline-variant"}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  </div>
);

export default Settings;