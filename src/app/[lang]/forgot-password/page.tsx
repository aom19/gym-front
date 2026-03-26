import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Dumbbell } from "lucide-react";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth");

  return (
    <main className="min-h-screen flex">
      {/* Left hero panel */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col">
        <Image
          src="https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=1280&h=960&dpr=1"
          alt="Yoga class"
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-1 flex-col justify-between p-10">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Dumbbell className="size-4" />
            </div>
            <span className="text-lg font-bold text-white">GymPro</span>
          </div>
          <blockquote className="space-y-2">
            <p className="text-xl font-semibold text-white/90">&ldquo;Small steps lead to big changes.&rdquo;</p>
            <p className="text-sm text-white/60">GymPro Community</p>
          </blockquote>
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex flex-1 flex-col items-center justify-center bg-background px-6 py-12 sm:px-10">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>

        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Dumbbell className="size-4" />
          </div>
          <span className="text-lg font-bold text-foreground">GymPro</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8 space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("forgotTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("forgotSubtitle")}</p>
          </div>
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
