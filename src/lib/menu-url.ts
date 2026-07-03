export type MenuUrlOptions = {
  branchSlug: string;
  subdomain?: string | null;
  customDomain?: string | null;
  origin?: string;
  table?: number;
};

function getAppDomain(appUrl: string): string {
  return (process.env.NEXT_PUBLIC_APP_DOMAIN || new URL(appUrl).hostname).toLowerCase();
}

export function buildMenuUrl({
  branchSlug,
  subdomain,
  customDomain,
  origin,
  table,
}: MenuUrlOptions): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const protocol = new URL(appUrl).protocol;
  const appDomain = getAppDomain(appUrl);

  const subdomainsSupported = appDomain !== "localhost" && appDomain.includes(".");

  let base: string;
  if (customDomain) {
    base = `${protocol}//${customDomain}`;
  } else if (subdomain && subdomainsSupported) {
    base = `${protocol}//${subdomain}.${appDomain}`;
  } else {
    base = origin ?? new URL(appUrl).origin;
  }

  const path = `/menu/${branchSlug}`;
  const url = `${base}${path}`;
  return table ? `${url}?table=${table}` : url;
}
