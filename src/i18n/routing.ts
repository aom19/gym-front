import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    locales: ["ro", "en", "ru"],
    defaultLocale: "ro",
    localeCookie: { name: "lang", sameSite: "lax" },
    localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];
