import { AdminShell } from "@/components/admin/admin-shell"
import { AdminDashboard } from "@/components/admin/dashboard"

export const metadata = { title: "Admin Dashboard — FitAI" }

export default function AdminPage() {
  return (
    <AdminShell>
      <AdminDashboard />
    </AdminShell>
  )
}
