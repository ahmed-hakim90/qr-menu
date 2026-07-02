import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { isTenantHost } from "./lib/tenant-host";

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  if (!pathname.startsWith("/api") && isTenantHost(host)) {
    try {
      const resolveUrl = new URL("/api/tenant/resolve", request.url);
      resolveUrl.searchParams.set("host", host);

      const menuMatch = pathname.match(/\/(?:ar\/|en\/)?menu\/([^/]+)/);
      if (menuMatch?.[1]) {
        resolveUrl.searchParams.set("branch", menuMatch[1]);
      }

      const response = await fetch(resolveUrl);
      if (response.ok) {
        const data = await response.json();
        const rewriteUrl = request.nextUrl.clone();
        const localePrefix = pathname.startsWith("/en") ? "/en" : "";
        rewriteUrl.pathname = `${localePrefix}/menu/${data.branchSlug}`;
        return NextResponse.rewrite(rewriteUrl);
      }
    } catch {
      // Continue with normal routing if tenant resolution fails.
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!pathname.startsWith("/admin/login") && !request.cookies.get("platform_session")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard") || pathname.match(/\/[a-z]{2}\/dashboard/)) {
    const session = request.cookies.get("session");
    if (!session) {
      const locale = pathname.startsWith("/en") ? "en" : "ar";
      const loginUrl = new URL(
        `/${locale === "ar" ? "" : "en/"}auth/login`,
        request.url
      );
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
