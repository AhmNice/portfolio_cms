import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import { useNavigate } from "react-router-dom";

interface LoginFormData {
  email: string;
  password: string;
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormData) => {
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await login(data);
      if (res.success) {
        navigate("/dashboard");
      } else {
        setFormError(res.message || "Invalid email or password");
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grid md:grid-cols-[1.1fr_1fr]">
      {/* Editorial panel */}
      <div className="relative hidden md:flex flex-col justify-between overflow-hidden bg-surface-container/60 border-r border-outline-variant/10 p-12 lg:p-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 42px, currentColor 43px)",
          }}
        />
        <span className="relative font-heading text-lg font-semibold text-on-surface">
          Ghost CMS
        </span>

        <div className="relative max-w-md">
          <p className="font-heading text-4xl lg:text-5xl leading-[1.1] text-on-surface">
            Write it once. Publish it everywhere.
          </p>
          <p className="font-body text-body-md text-on-surface-variant mt-6 leading-relaxed">
            Drafts, pages, and newsletters, kept in one editorial home so nothing
            gets lost between the idea and the byline.
          </p>
        </div>

        <p className="relative font-body text-body-sm text-on-surface-variant/60">
          {/* Trusted by independent publishers and small newsrooms. */}
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <span className="md:hidden font-heading text-base font-semibold text-on-surface">
              Ghost CMS
            </span>
            <h1 className="font-heading text-headline-xl font-bold text-on-surface mt-3 md:mt-0">
              Sign in
            </h1>
            <p className="font-body text-body-sm text-on-surface-variant mt-2">
              Enter your details to get back to your desk.
            </p>
          </div>

          {formError && (
            <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-400">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block font-body text-sm font-medium text-on-surface mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="john@example.com"
                disabled={submitting}
                aria-invalid={!!errors.email}
                className={`w-full bg-surface-container-high/50 border rounded-lg py-2.5 px-3.5 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors disabled:opacity-60 ${
                  errors.email
                    ? "border-red-400/50 focus:border-red-400"
                    : "border-outline-variant/20 focus:border-primary/50"
                }`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label htmlFor="password" className="block font-body text-sm font-medium text-on-surface">
                  Password
                </label>
                <button type="button" onClick={() => navigate("/auth/recover-password")} className="font-body text-xs text-primary hover:underline">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  disabled={submitting}
                  aria-invalid={!!errors.password}
                  className={`w-full bg-surface-container-high/50 border rounded-lg py-2.5 px-3.5 pr-11 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors disabled:opacity-60 ${
                    errors.password
                      ? "border-red-400/50 focus:border-red-400"
                      : "border-outline-variant/20 focus:border-primary/50"
                  }`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={submitting}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-primary transition-colors disabled:opacity-60"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg bg-primary text-on-primary font-body font-medium text-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;