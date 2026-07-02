import { redirect } from "next/navigation";
import { getPlatformSession } from "@/lib/platform-auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getPlatformSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar adminName={session.name} />
      <main className="lg:ps-64 min-h-screen">
        <div className="p-6 pt-16 lg:pt-6">{children}</div>
      </main>
    </div>
  );
}
