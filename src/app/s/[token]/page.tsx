import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { resolveScanToken } from "@/features/cards/services/card-service";

interface ScanPageProps {
  params: Promise<{ token: string }>;
}

export default async function ScanRedirectPage({ params }: ScanPageProps) {
  const { token } = await params;
  const headersList = await headers();

  const result = await resolveScanToken(token, {
    ip: headersList.get("x-forwarded-for")?.split(",")[0]?.trim(),
    userAgent: headersList.get("user-agent") ?? undefined,
    language: headersList.get("accept-language")?.split(",")[0],
    referrer: headersList.get("referer") ?? undefined,
  });

  if (result.error === "rate_limited") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">Too many requests</h1>
          <p className="text-muted-foreground">Please try again in a moment.</p>
        </div>
      </div>
    );
  }

  if (result.error === "invalid_token" || result.error === "card_disabled") {
    notFound();
  }

  if (result.error === "not_assigned") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">Card not assigned</h1>
          <p className="text-muted-foreground">
            This QR code has not been assigned to a restaurant yet.
          </p>
        </div>
      </div>
    );
  }

  redirect(result.menuUrl);
}
