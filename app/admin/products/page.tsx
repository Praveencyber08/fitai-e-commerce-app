import { AdminShell } from "@/components/admin/admin-shell"
import { AdminProductsTable } from "@/components/admin/products-table"

export const metadata = { title: "Products — FitAI Admin" }

export default function AdminProductsPage() {
  return (
    <AdminShell>
      <AdminProductsTable />
    </AdminShell>
  )
}
