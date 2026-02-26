"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Cpu,
  FolderKanban,
  Menu,
  LogOut,
  UserCog,
  Shield,
  Inbox,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/admin/projects",
    label: "Projets",
    icon: FolderKanban,
    admin: true,
  },
  { href: "/admin/team", label: "Equipe", icon: Users, admin: true },
  {
    href: "/admin/technologies",
    label: "Technologies",
    icon: Cpu,
    admin: true,
  },
  {
    href: "/admin/users",
    label: "Utilisateurs",
    icon: UserCog,
    admin: true,
  },
  {
    href: "/admin/roles",
    label: "Roles",
    icon: Shield,
    admin: true,
  },
  {
    href: "/admin/requests",
    label: "Demandes",
    icon: Inbox,
    admin: true,
  },
];

function NavContent({
  pathname,
  role,
}: {
  pathname: string;
  role?: string;
}) {
  const filteredItems = navItems.filter(
    (item) => !item.admin || role === "ADMIN"
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
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
      </div>
      <Separator className="opacity-50" />
      <nav className="flex-1 p-3 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-3 mb-2">
          Navigation
        </p>
        {filteredItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              pathname === item.href ||
                pathname.startsWith(item.href + "/")
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <Separator className="opacity-50" />
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground rounded-xl hover:bg-muted/50"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          Deconnexion
        </Button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border/40 bg-muted/20 h-screen sticky top-0">
      <NavContent pathname={pathname} role={role} />
    </aside>
  );
}

export function MobileSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden rounded-xl">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 rounded-r-2xl">
        <div onClick={() => setOpen(false)}>
          <NavContent pathname={pathname} role={role} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
