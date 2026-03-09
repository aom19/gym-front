"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ResetPasswordResponse {
  status: "ok" | "success";
  message: string;
}

/** Returns 0-4 strength score for a password */
function getPasswordStrength(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const strengthConfig = [
  { label: "Too short",  bar: "bg-destructive",    text: "text-destructive" },
  { label: "Weak",       bar: "bg-orange-500",      text: "text-orange-500" },
  { label: "Fair",       bar: "bg-yellow-500",      text: "text-yellow-500" },
  { label: "Good",       bar: "bg-blue-500",        text: "text-blue-500" },
  { label: "Strong",     bar: "bg-green-500",        text: "text-green-500" },
];

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const lang = (params?.lang as string) || "ro";
  const t = useTranslations("auth");
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [manualToken, setManualToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => tokenFromUrl || manualToken, [tokenFromUrl, manualToken]);
  const strength = getPasswordStrength(password);
  const strengthInfo = strengthConfig[strength];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      const tokenError = "Reset token is required.";
      setError(tokenError);
      toast.error(tokenError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/auth/reset-password?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          confirmPassword,
        }),
      });

      const payload = (await response.json()) as ResetPasswordResponse | { message?: string };

      if (!response.ok) {
        const message = "message" in payload ? payload.message ?? "Reset password failed" : "Reset password failed";
        setError(message);
        toast.error(message);
        return;
      }

      const successMessage = "message" in payload
        ? payload.message ?? "Password updated successfully."
        : "Password updated successfully.";
      toast.success(successMessage);
      router.replace(`/${lang}/login`);
    } catch {
      const fallback = "Unexpected error. Please try again.";
      setError(fallback);
      toast.error(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {!tokenFromUrl ? (
        <div className="grid gap-2">
          <label htmlFor="token" className="text-sm font-medium text-foreground">
            {t("resetToken")}
          </label>
          <Input
            id="token"
            name="token"
            type="text"
            value={manualToken}
            onChange={(event) => setManualToken(event.target.value)}
            placeholder={t("resetTokenPlaceholder")}
            required
          />
        </div>
      ) : null}

      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          {t("newPassword")}
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="New secure password"
            autoComplete="new-password"
            className="pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-2 my-auto flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Password strength indicator */}
        {password.length > 0 && (
          <div className="mt-2 space-y-1.5">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    strength >= level ? strengthInfo.bar : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs font-medium ${strengthInfo.text}`}>
              {strengthInfo.label}
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
          {t("confirmPassword")}
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat password"
            autoComplete="new-password"
            className="pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute inset-y-0 right-2 my-auto flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={isLoading} className="h-11">
        {isLoading ? "Updating..." : t("resetButton")}
      </Button>

      <Link
        href={`/${lang}/login`}
        className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
      >
        {t("backToLogin")}
      </Link>
    </form>
  );
}
