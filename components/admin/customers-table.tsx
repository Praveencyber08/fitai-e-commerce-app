"use client"

import useSWR from "swr"
import { ADMIN_CUSTOMERS } from "@/lib/data/admin"
import { formatPrice, formatDate } from "@/lib/format"
import { fetcher } from "@/lib/fetcher"

type CustomerRow = {
  id: string
  name: string
  email: string
  joinedAt: string
  orders: number
  spend: number
}

export function AdminCustomersTable() {
  const { data } = useSWR<{ customers: CustomerRow[]; dbConfigured: boolean }>("/api/admin/customers", fetcher)
  const customers = data?.customers && data.customers.length > 0 ? data.customers : ADMIN_CUSTOMERS

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">{customers.length} registered customers</p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Orders</th>
                <th className="px-5 py-3 text-right font-medium">Total Spend</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {c.name.charAt(0)}
                      </div>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{c.email}</td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(c.joinedAt)}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.orders}</td>
                  <td className="px-5 py-3 text-right font-medium">{formatPrice(c.spend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
