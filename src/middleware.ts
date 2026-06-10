import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Session } from "next-auth";

import { getRedirect } from "@/lib/auth/helpers";

// Protect all routes except /login and Next.js internals
export default auth((req: NextRequest & { auth: Session | null }) => {
  // Bypass auth protection in E2E / mock environments (CI)
  if (process.env.SKIP_AUTH === "true") return NextResponse.next();

  const target = getRedirect(req.nextUrl.pathname, req.auth);
  if (target) {
    return NextResponse.redirect(new URL(target, req.url));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
