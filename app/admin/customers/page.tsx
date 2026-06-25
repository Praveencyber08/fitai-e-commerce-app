import { AdminShell } from "@/components/admin/admin-shell"
import { AdminCustomersTable } from "@/components/admin/customers-table"

export const metadata = { title: "Customers — FitAI Admin" }

export default function AdminCustomersPage() {
  return (
    <AdminShell>
      <AdminCustomersTable />
    </AdminShell>
  )
}
