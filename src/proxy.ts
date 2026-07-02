import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
