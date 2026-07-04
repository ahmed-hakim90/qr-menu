import { db } from "@/lib/db";

function normalizeHost(host: string) {
  return host.split(":")[0].toLowerCase();
}

export function getAppHostname() {
  if (process.env.NEXT_PUBLIC_APP_DOMAIN) {
    return process.env.NEXT_PUBLIC_APP_DOMAIN.toLowerCase();
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return new URL(process.env.NEXT_PUBLIC_APP_URL).hostname.toLowerCase();
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return process.env.VERCEL_PROJECT_PRODUCTION_URL.toLowerCase();
  }

  return "localhost";
}

export function getAppDomain() {
  return getAppHostname();
}

export function extractSubdomain(host: string) {
  const cleanHost = normalizeHost(host);
  const appDomain = getAppDomain();

  if (cleanHost === appDomain || cleanHost === "localhost") {
    return null;
  }

  if (cleanHost.endsWith(`.${appDomain}`)) {
    const subdomain = cleanHost.slice(0, -(appDomain.length + 1));
    if (subdomain && subdomain !== "www") {
      return subdomain;
    }
  }

  return null;
}

export function isTenantHost(host: string) {
  const cleanHost = normalizeHost(host);
  const appDomain = getAppDomain();

  if (cleanHost === "localhost" || cleanHost === appDomain || cleanHost === `www.${appDomain}`) {
    return false;
  }

  return Boolean(extractSubdomain(cleanHost) || !cleanHost.endsWith(appDomain));
}

export async function resolveRestaurantByHost(host: string) {
  const cleanHost = normalizeHost(host);

  const byCustomDomain = await db.restaurant.findFirst({
    where: { customDomain: cleanHost },
    include: {
      branches: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (byCustomDomain) {
    return byCustomDomain;
  }

  const subdomain = extractSubdomain(cleanHost);
  if (!subdomain) {
    return null;
  }

  return db.restaurant.findFirst({
    where: { subdomain },
    include: {
      branches: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}
