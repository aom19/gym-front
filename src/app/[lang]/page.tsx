import { redirect } from "next/navigation";
import { getUser } from "@/utils/auth";

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const user = await getUser();

  if (user?.role === "ADMIN") {
    redirect(`/${lang}/admin/dashboard`);
  }

  redirect(`/${lang}/login`);
}
