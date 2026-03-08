"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ForgotPasswordResponse {
  status: "ok" | "success";
  message: string;
}

export function ForgotPasswordForm() {
  const params = useParams();
  const lang = (params?.lang as string) || "ro";
  const t = useTranslations("auth");

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as ForgotPasswordResponse | { message?: string };

      if (!response.ok) {
        const errorMessage = "message" in payload ? payload.message ?? "Request failed" : "Request failed";
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      const successMessage =
        "message" in payload
          ? (payload.message ?? t("emailSent"))
          : t("emailSent");
      setMessage(successMessage);
      toast.success(successMessage);
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
      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          {t("email")}
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </div>

      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={isLoading} className="h-11">
        {isLoading ? "Sending..." : t("forgotButton")}
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

