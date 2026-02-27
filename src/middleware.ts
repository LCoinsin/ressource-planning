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

  // Routes admin → vérifier rôle ou permissions
  if (pathname.startsWith("/admin")) {
    const permissions = (token.permissions as string[]) || [];
    const isAdmin =
      token.role === "Admin" || permissions.includes("CAN_MANAGE_USERS");
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
