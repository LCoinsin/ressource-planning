"use client";

import { useSession } from "next-auth/react";
import { MobileSidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="flex h-14 items-center gap-4 px-4">
        <MobileSidebar />
        <div className="flex-1" />
        {user && (
          <div className="flex items-center gap-3">
            <Badge
              variant={user.role === "ADMIN" ? "default" : "secondary"}
              className="rounded-lg text-[10px] font-semibold"
            >
              {user.role === "ADMIN" ? "Admin" : "Visiteur"}
            </Badge>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border border-border/50">
                <AvatarFallback className="text-xs bg-muted/50">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">
                {user.name}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
