import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

interface RecoverPasswordData {
  secretKey: string;
}

interface RecoveryState {
  secretKey: string;
  token?: string;
}

const REDIRECT_SECONDS = 5;

const RecoverPassword = () => {
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [recoveryState, setRecoveryState] = useState<RecoveryState | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const navigate = useNavigate();
  const requestRecovery = useAuthStore((s) => s.requestAccountRecovery);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoverPasswordData>();

  const goToChangePassword = (state: RecoveryState) => {
    navigate("/auth/reset-password", { state });
  };

  // Ticks the countdown down once a second and redirects at zero.
  useEffect(() => {
    if (countdown === null || !recoveryState) return;
    if (countdown <= 0) {
      goToChangePassword(recoveryState);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, recoveryState]);

  const onSubmit = async (data: RecoverPasswordData) => {
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      const res = await requestRecovery(data.secretKey);
      const recoveryData = res.data as { recoveryToken: string } | undefined;

      if (!res.success) {
        setFormError("We couldn't verify that secret key. Please try again.");
        return;
      }

      setFormSuccess(
        "Check your email for instructions to reset your password, or proceed directly below.",
      );
      setRecoveryState({ secretKey: data.secretKey, token: recoveryData?.recoveryToken });
      setCountdown(REDIRECT_SECONDS);
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
            Lost the key, not the work.
          </p>
          <p className="font-body text-body-md text-on-surface-variant mt-6 leading-relaxed">
            Your secret key gets you back into your account without losing a
            single draft.
          </p>
        </div>

        <p className="relative font-body text-body-sm text-on-surface-variant/60">
          Keep your secret key somewhere safe once you're back in.
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
              Recover password
            </h1>
            <p className="font-body text-body-sm text-on-surface-variant mt-2">
              Enter your secret key to recover your password.
            </p>
          </div>

          {formError && (
            <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-400">{formError}</p>
            </div>
          )}

          {formSuccess && (
            <div className="mb-6 rounded-lg border border-green-400/30 bg-green-400/10 px-3 py-2.5">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-500">{formSuccess}</p>
              </div>
              {countdown !== null && recoveryState && (
                <div className="flex items-center justify-between mt-2.5 pl-6">
                  <p className="text-xs text-green-500/80">
                    Continuing in {countdown}s…
                  </p>
                  <button
                    type="button"
                    onClick={() => goToChangePassword(recoveryState)}
                    className="text-xs font-medium text-green-600 hover:underline"
                  >
                    Continue now
                  </button>
                </div>
              )}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            <div>
              <label
                htmlFor="secretKey"
                className="block font-body text-sm font-medium text-on-surface mb-1.5"
              >
                Secret key
              </label>
              <div className="relative">
                <input
                  id="secretKey"
                  type={showKeyInput ? "text" : "password"}
                  autoComplete="off"
                  placeholder="Enter your secret key"
                  disabled={submitting}
                  aria-invalid={!!errors.secretKey}
                  className={`w-full bg-surface-container-high/50 border rounded-lg py-2.5 px-3.5 pr-11 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors disabled:opacity-60 ${
                    errors.secretKey
                      ? "border-red-400/50 focus:border-red-400"
                      : "border-outline-variant/20 focus:border-primary/50"
                  }`}
                  {...register("secretKey", {
                    required: "Secret key is required",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowKeyInput((prev) => !prev)}
                  disabled={submitting}
                  tabIndex={-1}
                  aria-label={
                    showKeyInput ? "Hide secret key" : "Show secret key"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-primary transition-colors disabled:opacity-60"
                >
                  {showKeyInput ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.secretKey && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.secretKey.message}
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
                  Recovering...
                </>
              ) : (
                "Recover password"
              )}
            </button>
          </form>

          <p className="font-body text-body-sm text-on-surface-variant text-center mt-8">
            Remembered it after all?{" "}
            <button
              type="button"
              onClick={() => navigate("/auth/login")}
              className="text-primary hover:underline"
            >
              Back to sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecoverPassword;