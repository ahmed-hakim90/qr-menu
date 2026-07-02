import { redirect } from "next/navigation";
import { getSession, hasPermission } from "@/lib/auth";
import { CaptainDashboard } from "@/components/captain/captain-dashboard";

export default async function CaptainPage() {
  const session = await getSession();
  if (!session || !hasPermission(session.role, ["CAPTAIN"])) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Captain Dashboard</h1>
        <p className="text-sm text-muted-foreground">Serve active tables and advance order statuses.</p>
      </div>
      <CaptainDashboard />
    </div>
  );
}
