import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicPaths = ["/", "/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // NextAuth v5 uses "authjs.session-token" (not "next-auth.session-token")
  // On HTTPS (production) it's prefixed with "__Secure-"
  const secureCookie = req.nextUrl.protocol === "https:";
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie,
  });
  const isLoggedIn = !!token;

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

  // Routes admin → vérifier la permission requise pour chaque route
  if (pathname.startsWith("/admin")) {
    const permissions = (token.permissions as string[]) || [];

    const routePermissions: Record<string, string> = {
      "/admin/projects": "CAN_MANAGE_PROJECTS",
      "/admin/team": "CAN_MANAGE_TEAM",
      "/admin/technologies": "CAN_MANAGE_TECHNOLOGIES",
      "/admin/users": "CAN_MANAGE_USERS",
      "/admin/roles": "CAN_MANAGE_ROLES",
      "/admin/requests": "CAN_VIEW_REQUESTS",
    };

    const requiredPermission = Object.entries(routePermissions).find(
      ([route]) => pathname === route || pathname.startsWith(route + "/")
    )?.[1];

    const hasAccess =
      !requiredPermission || permissions.includes(requiredPermission);

    if (!hasAccess) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
