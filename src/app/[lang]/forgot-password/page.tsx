import { getTranslations } from "next-intl/server";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth");

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -top-40 -left-24 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-8 h-96 w-96 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>

      <section className="relative mx-auto flex min-h-[85vh] w-full max-w-md items-center">
        <div className="w-full rounded-3xl border border-border bg-card/95 p-6 shadow-xl backdrop-blur sm:p-8">
          <div className="mb-8 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">
              {t("forgotTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("forgotSubtitle")}</p>
          </div>
          <ForgotPasswordForm />
        </div>
      </section>
    </main>
  );
}
