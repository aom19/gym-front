import { redirect } from "next/navigation";

// Root path is handled by the next-intl middleware which redirects to /{lang}.
// This page acts as a server-side fallback for edge cases where middleware is bypassed.
export default function RootPage() {
  redirect("/ro");
}
