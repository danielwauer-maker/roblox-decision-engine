import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/admin-auth";
import AdminDashboard from "./AdminDashboard";
import AdminWorkspaceAccess from "./AdminWorkspaceAccess";
import BillingStatus from "./BillingStatus";
import PilotApplications from "./PilotApplications";
import R17PilotOps from "./R17PilotOps";
import SimulationSeeder from "./SimulationSeeder";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminSession(session)) redirect("/admin/login");
  return (
    <div style={{ minHeight: "100vh", background: "#06111f", color: "#edf6ff" }}>
      <PilotApplications />
      <R17PilotOps />
      <BillingStatus />
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "1px clamp(18px, 4vw, 42px) 0" }}>
        <SimulationSeeder />
      </div>
      <AdminWorkspaceAccess />
      <AdminDashboard />
    </div>
  );
}
