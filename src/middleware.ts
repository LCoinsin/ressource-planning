import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicPaths = ["/", "/login"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Pages publiques → laisser passer
  if (publicPaths.includes(pathname)) {
    if (pathname === "/login" && isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Tout le reste nécessite login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Routes admin → vérifier rôle ou permissions
  if (pathname.startsWith("/admin")) {
    const user = req.auth?.user as { role?: string; permissions?: string[] } | undefined;
    const permissions = user?.permissions ?? [];
    const isAdmin =
      user?.role === "Admin" || permissions.includes("CAN_MANAGE_USERS");
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
