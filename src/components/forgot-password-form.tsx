"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";

interface ForgotPasswordResponse {
  status: "ok" | "success";
  message: string;
}

export function ForgotPasswordForm() {
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

      const successMessage = "message" in payload
        ? payload.message ?? "If the email exists, a reset link has been sent."
        : "If the email exists, a reset link has been sent.";
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
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email
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

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" disabled={isLoading} className="h-11">
        {isLoading ? "Sending..." : "Send reset link"}
      </Button>

      <Link href="/login" className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline">
        Back to login
      </Link>
    </form>
  );
}
