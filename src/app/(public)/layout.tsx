import Link from "next/link";
import { LayoutDashboard, LogIn } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="rounded-xl bg-primary/10 p-2">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="font-bold text-sm">Resource</span>
              <span className="font-bold text-sm text-primary ml-1">
                Planning
              </span>
            </div>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Se connecter
          </Link>
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-muted-foreground">
          Resource Planning &mdash; Outil interne de gestion de planning
        </div>
      </footer>
    </div>
  );
}
