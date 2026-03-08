import { PublicNavbar } from "@/components/layout/public-navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} GymPro. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
