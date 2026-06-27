"use client"

import useSWR from "swr"
import { TrendingUp, ShoppingBag, Users, IndianRupee, ArrowUpRight } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { ADMIN_ORDERS, ADMIN_CUSTOMERS, SALES_BY_MONTH, CATEGORY_SPLIT } from "@/lib/data/admin"
import { PRODUCTS } from "@/lib/data/products"
import { formatPrice, formatDate } from "@/lib/format"
import { fetcher } from "@/lib/fetcher"
import type { Order } from "@/lib/types"

type StatsResponse = {
  dbConfigured: boolean
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  salesByMonth: { month: string; revenue: number; orders: number }[]
  categorySplit: { category: string; value: number }[]
  recentOrders: Order[]
}

const revenueConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
} satisfies ChartConfig

const ordersConfig = {
  orders: { label: "Orders", color: "var(--chart-3)" },
} satisfies ChartConfig

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  delivered: "default",
  shipped: "secondary",
  out_for_delivery: "secondary",
  processing: "outline",
  cancelled: "outline",
}

export function AdminDashboard() {
  const { data } = useSWR<StatsResponse>("/api/admin/stats", fetcher)
  const live = data?.dbConfigured && data.totalOrders > 0

  const salesByMonth = live && data!.salesByMonth.length > 0 ? data!.salesByMonth : SALES_BY_MONTH
  const categorySplit = live && data!.categorySplit.length > 0 ? data!.categorySplit : CATEGORY_SPLIT
  const recentOrders = live && data!.recentOrders.length > 0 ? data!.recentOrders : ADMIN_ORDERS

  const totalRevenue = live ? data!.totalRevenue : SALES_BY_MONTH.reduce((s, m) => s + m.revenue, 0)
  const totalOrders = live ? data!.totalOrders : SALES_BY_MONTH.reduce((s, m) => s + m.orders, 0)
  const totalCustomers = live ? data!.totalCustomers : ADMIN_CUSTOMERS.length
  const totalProducts = data?.totalProducts ?? PRODUCTS.length

  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue), change: "+18.2%", icon: IndianRupee },
    { label: "Orders", value: totalOrders.toLocaleString(), change: "+12.5%", icon: ShoppingBag },
    { label: "Customers", value: totalCustomers.toString(), change: "+8.1%", icon: Users },
    { label: "Products", value: totalProducts.toString(), change: "+4 new", icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your store performance</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  {s.change}
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 md:col-span-2">
          <h2 className="font-semibold">Revenue Trend</h2>
          <p className="mb-4 text-sm text-muted-foreground">Monthly revenue over time</p>
          <ChartContainer config={revenueConfig} className="h-48 w-full md:h-64">
            <AreaChart data={salesByMonth} margin={{ left: 4, right: 4 }}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="revenue"
                type="monotone"
                fill="url(#fillRevenue)"
                stroke="var(--color-revenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-semibold">Sales by Category</h2>
          <p className="mb-4 text-sm text-muted-foreground">Share of total sales</p>
          <ChartContainer config={{}} className="mx-auto h-48 w-full md:h-56">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="category" />} />
              <Pie data={categorySplit} dataKey="value" nameKey="category" innerRadius={45} strokeWidth={2}>
                {categorySplit.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="mt-2 space-y-1">
            {categorySplit.map((c, i) => (
              <div key={c.category} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {c.category}
                </span>
                <span className="text-muted-foreground">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Orders per Month</h2>
        <p className="mb-4 text-sm text-muted-foreground">Order volume trend</p>
        <ChartContainer config={ordersConfig} className="h-40 w-full md:h-56">
          <BarChart data={salesByMonth} margin={{ left: 4, right: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>

      {/* Recent orders */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b p-4 md:p-5">
          <h2 className="font-semibold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium md:px-5">Order ID</th>
                <th className="px-4 py-3 font-medium md:px-5">Customer</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell md:px-5">Date</th>
                <th className="px-4 py-3 font-medium md:px-5">Status</th>
                <th className="px-4 py-3 text-right font-medium md:px-5">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.slice(0, 6).map((o) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium md:px-5">#{o.id}</td>
                  <td className="px-4 py-3 md:px-5">{o.address.fullName}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell md:px-5">{formatDate(o.placedAt)}</td>
                  <td className="px-4 py-3 md:px-5">
                    <Badge variant={statusVariant[o.status]} className="capitalize">
                      {o.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-medium md:px-5">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
