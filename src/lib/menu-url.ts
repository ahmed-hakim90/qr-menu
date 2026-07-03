import { getAppDomain } from "@/lib/tenant-host";

export type MenuUrlOptions = {
  branchSlug: string;
  subdomain?: string | null;
  customDomain?: string | null;
  origin?: string;
  table?: number;
};

export function buildMenuUrl({
  branchSlug,
  subdomain,
  customDomain,
  origin,
  table,
}: MenuUrlOptions): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const protocol = new URL(appUrl).protocol;
  const appDomain = getAppDomain();

  let base: string;
  if (customDomain) {
    base = `${protocol}//${customDomain}`;
  } else if (subdomain) {
    base = `${protocol}//${subdomain}.${appDomain}`;
  } else {
    base = origin ?? new URL(appUrl).origin;
  }

  const path = `/menu/${branchSlug}`;
  const url = `${base}${path}`;
  return table ? `${url}?table=${table}` : url;
}
