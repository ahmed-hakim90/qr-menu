import { redirect } from "next/navigation";
import { getSession, hasPermission } from "@/lib/auth";
import { CashierDashboard } from "@/components/cashier/cashier-dashboard";

export default async function CashierPage() {
  const session = await getSession();
  if (!session || !hasPermission(session.role, ["CASHIER"])) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cashier Dashboard</h1>
        <p className="text-sm text-muted-foreground">Collect cash or launch Paymob checkout for waiting bills.</p>
      </div>
      <CashierDashboard />
    </div>
  );
}
