import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/admin-auth";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminSession(session)) redirect("/admin/login");
  return <AdminDashboard />;
}
