export type MenuUrlOptions = {
  branchSlug: string;
  customDomain?: string | null;
  origin?: string;
  table?: number;
};

export function buildMenuUrl({
  branchSlug,
  customDomain,
  origin,
  table,
}: MenuUrlOptions): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const protocol = new URL(appUrl).protocol;

  let base: string;
  if (customDomain) {
    base = `${protocol}//${customDomain}`;
  } else {
    base = origin ?? new URL(appUrl).origin;
  }

  const path = `/menu/${branchSlug}`;
  const url = `${base}${path}`;
  return table ? `${url}?table=${table}` : url;
}
