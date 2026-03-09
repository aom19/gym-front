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

  const contactItems = [
    {
      Icon: Mail,
      label: t("emailLabel"),
      value: "hello@gympro.md",
      href: "mailto:hello@gympro.md",
    },
    {
      Icon: Phone,
      label: t("phoneLabel"),
      value: "+373 22 000 100",
      href: "tel:+37322000100",
    },
    {
      Icon: MapPin,
      label: t("hqLabel"),
      value: "Str. Ștefan cel Mare 1, Chișinău, Moldova",
      href: null,
    },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{tNav("contact")}</h1>
          <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact info cards */}
          <div className="flex flex-col gap-4">
            {contactItems.map(({ Icon, label, value, href }) => (
              <div
                key={label}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 ring-1 ring-foreground/10 transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      className="mt-0.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="mt-0.5 text-sm text-muted-foreground">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Contact form */}
          <form className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 ring-1 ring-foreground/10">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-foreground">{t("nameField")}</label>
              <input
                id="name"
                type="text"
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground transition focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder={t("namePlaceholder")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">{t("emailField")}</label>
              <input
                id="email"
                type="email"
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground transition focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="hello@example.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="text-sm font-medium text-foreground">{t("messageField")}</label>
              <textarea
                id="message"
                rows={4}
                className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground transition focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder={t("messagePlaceholder")}
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 hover:scale-105"
            >
              {t("sendButton")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
