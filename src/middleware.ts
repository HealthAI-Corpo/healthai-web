import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protect all routes except /login and Next.js internals
export default auth((req: NextRequest & { auth: unknown }) => {
  // Bypass auth protection in E2E / mock environments (CI)
  if (process.env.SKIP_AUTH === "true") return NextResponse.next();

  const isLoggedIn = !!(req as { auth: unknown }).auth;
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
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
