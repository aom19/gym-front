import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, Phone, MapPin } from "lucide-react";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  setRequestLocale(lang);
  const tNav = await getTranslations("nav");
  const t = await getTranslations("contact");

  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{tNav("contact")}</h1>
          <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          {/* Contact info */}
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t("emailLabel")}</p>
                <p className="text-sm text-muted-foreground">hello@gympro.md</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Phone className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t("phoneLabel")}</p>
                <p className="text-sm text-muted-foreground">+373 22 000 100</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MapPin className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t("hqLabel")}</p>
                <p className="text-sm text-muted-foreground">Str. Ștefan cel Mare 1, Chișinău, Moldova</p>
              </div>
            </div>
          </div>

          {/* Simple form (static, frontend only) */}
          <form className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10">
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-sm font-medium text-foreground">{t("nameField")}</label>
              <input
                id="name"
                type="text"
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={t("namePlaceholder")}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium text-foreground">{t("emailField")}</label>
              <input
                id="email"
                type="email"
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="hello@example.com"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="message" className="text-sm font-medium text-foreground">{t("messageField")}</label>
              <textarea
                id="message"
                rows={4}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={t("messagePlaceholder")}
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              {t("sendButton")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
