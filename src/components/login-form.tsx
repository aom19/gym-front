"use client";

import { FormEvent, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user?: {
    id: string;
    email: string;
    role: string;
    location?: {
      id: string;
      name: string;
    } | null;
  };
}

const LOGIN_ENDPOINT = process.env.NEXT_PUBLIC_LOGIN_ENDPOINT ?? "http://localhost:3000/auth/login";

export function LoginForm() {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "ro";
  const t = useTranslations("auth");
  const tErrors = useTranslations("errors");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as LoginResponse | { message?: string };

      if (!response.ok) {
        const message =
          typeof payload === "object" && payload && "message" in payload
            ? payload.message || tErrors("loginFailed")
            : tErrors("loginFailed");
        setError(message);
        toast.error(message);
        return;
      }

      const data = payload as LoginResponse;

      // Fallback persistence for environments where cookies are unavailable.
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      toast.success("Login successful");

      if (data.user?.role === "ADMIN") {
        router.replace(`/${lang}/admin/dashboard`);
        return;
      }

      setError(tErrors("adminOnly"));
      toast.error(tErrors("adminOnly"));
    } catch {
      setError(tErrors("generic"));
      toast.error(tErrors("generic"));
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

      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          {t("password")}
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
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
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={isLoading} className="h-11">
        {isLoading ? "Signing in..." : t("loginButton")}
      </Button>

      <Link
        href={`/${lang}/forgot-password`}
        className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
      >
        {t("forgotPassword")}
      </Link>
    </form>
  );
}

