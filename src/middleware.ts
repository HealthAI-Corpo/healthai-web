import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Session } from "next-auth";

// Routes du groupe (admin) — réservées au rôle "admin"
const ADMIN_PATHS = ["/datasets", "/exports", "/validation"] as const;

// Protect all routes except /login and Next.js internals
export default auth((req: NextRequest & { auth: Session | null }) => {
  // Bypass auth protection in E2E / mock environments (CI)
  if (process.env.SKIP_AUTH === "true") return NextResponse.next();

  const session = req.auth;
  const isLoggedIn = !!session;
  const { pathname } = req.nextUrl;

  const isPublic =
    pathname === "/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico";

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/overview", req.url));
  }

  // Guard rôle : les pages admin redirigent les non-admins
  const isAdminPath = ADMIN_PATHS.some((path) => pathname.startsWith(path));
  if (session && isAdminPath && session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/overview", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
