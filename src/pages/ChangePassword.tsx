import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import { useLocation, useNavigate } from "react-router-dom";

interface ChangePasswordData {
  password: string;
  confirmPassword: string;
}

const ChangePassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const changePassword = useAuthStore((s) => s.changePassword);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordData>();

  const password = watch("password");
  const token = (location.state as { token?: string } | null)?.token;
  useEffect(() => {
    if (!token) {
      navigate("/auth/login", { replace: true });
    }
  }, [token, navigate]);

  const onSubmit = async (data: ChangePasswordData) => {
    if (!token) return;
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      const res = await changePassword({ newPassword: data.password, token });
      if (!res.success) {
        setFormError("Failed to change password. Please try again.");
        return;
      }

      setFormSuccess("Your password has been changed. Redirecting to login...");
      setTimeout(() => {
        navigate("/auth/login");
      }, 3000); // Redirect after 3 seconds
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // No token yet (or missing entirely) - the effect above is already
  // redirecting; render nothing instead of flashing the full form.
  if (!token) {
    return null;
  }

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
            A fresh key for the door.
          </p>
          <p className="font-body text-body-md text-on-surface-variant mt-6 leading-relaxed">
            Choose a new password to keep your drafts and pages secure.
          </p>
        </div>

        <p className="relative font-body text-body-sm text-on-surface-variant/60">
          Use at least 8 characters, mixing letters and numbers.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <span className="md:hidden font-heading text-base font-semibold text-on-surface">
              Ghost CMS
            </span>
            <h1 className="font-heading text-headline-md font-bold text-on-surface mt-3 md:mt-0">
              Change password
            </h1>
            <p className="font-body text-body-sm text-on-surface-variant mt-2">
              Enter a new password for your account.
            </p>
          </div>

          {formError && (
            <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-400">{formError}</p>
            </div>
          )}

          {formSuccess && (
            <div className="mb-6 flex items-start gap-2 rounded-lg border border-green-400/30 bg-green-400/10 px-3 py-2.5">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-green-500">{formSuccess}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            <div>
              <label
                htmlFor="password"
                className="block font-body text-sm font-medium text-on-surface mb-1.5"
              >
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  disabled={submitting}
                  aria-invalid={!!errors.password}
                  className={`w-full bg-surface-container-high/50 border rounded-lg py-2.5 px-3.5 pr-11 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors disabled:opacity-60 ${
                    errors.password
                      ? "border-red-400/50 focus:border-red-400"
                      : "border-outline-variant/20 focus:border-primary/50"
                  }`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
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
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block font-body text-sm font-medium text-on-surface mb-1.5"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                  disabled={submitting}
                  aria-invalid={!!errors.confirmPassword}
                  className={`w-full bg-surface-container-high/50 border rounded-lg py-2.5 px-3.5 pr-11 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors disabled:opacity-60 ${
                    errors.confirmPassword
                      ? "border-red-400/50 focus:border-red-400"
                      : "border-outline-variant/20 focus:border-primary/50"
                  }`}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  disabled={submitting}
                  tabIndex={-1}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-primary transition-colors disabled:opacity-60"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.confirmPassword.message}
                </p>
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
                  Changing password...
                </>
              ) : (
                "Change password"
              )}
            </button>
          </form>

          <p className="font-body text-body-sm text-on-surface-variant text-center mt-8">
            Changed your mind?{" "}
            <a href="/auth/login" className="text-primary hover:underline">
              Back to sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;