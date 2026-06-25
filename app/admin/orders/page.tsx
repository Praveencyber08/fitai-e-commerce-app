import { AdminShell } from "@/components/admin/admin-shell"
import { AdminOrdersTable } from "@/components/admin/orders-table"

export const metadata = { title: "Orders — FitAI Admin" }

export default function AdminOrdersPage() {
  return (
    <AdminShell>
      <AdminOrdersTable />
    </AdminShell>
  )
}
