"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";

interface ResetPasswordResponse {
  status: "ok" | "success";
  message: string;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [manualToken, setManualToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => tokenFromUrl || manualToken, [tokenFromUrl, manualToken]);

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
      router.replace("/login");
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
          <label htmlFor="token" className="text-sm font-medium text-slate-700">
            Reset Token
          </label>
          <Input
            id="token"
            name="token"
            type="text"
            value={manualToken}
            onChange={(event) => setManualToken(event.target.value)}
            placeholder="Paste token from email"
            required
          />
        </div>
      ) : null}

      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          New Password
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
            className="absolute inset-y-0 right-2 my-auto flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
          Confirm Password
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
            className="absolute inset-y-0 right-2 my-auto flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" disabled={isLoading} className="h-11">
        {isLoading ? "Updating..." : "Reset password"}
      </Button>

      <Link href="/login" className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline">
        Back to login
      </Link>
    </form>
  );
}
