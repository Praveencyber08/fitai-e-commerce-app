"use client"

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
  const totalRevenue = SALES_BY_MONTH.reduce((s, m) => s + m.revenue, 0)
  const totalOrders = SALES_BY_MONTH.reduce((s, m) => s + m.orders, 0)

  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue), change: "+18.2%", icon: IndianRupee },
    { label: "Orders", value: totalOrders.toLocaleString(), change: "+12.5%", icon: ShoppingBag },
    { label: "Customers", value: ADMIN_CUSTOMERS.length.toString(), change: "+8.1%", icon: Users },
    { label: "Products", value: PRODUCTS.length.toString(), change: "+4 new", icon: TrendingUp },
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
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 lg:col-span-2">
          <h2 className="font-semibold">Revenue Trend</h2>
          <p className="mb-4 text-sm text-muted-foreground">Monthly revenue over time</p>
          <ChartContainer config={revenueConfig} className="h-64 w-full">
            <AreaChart data={SALES_BY_MONTH} margin={{ left: 4, right: 4 }}>
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

        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Sales by Category</h2>
          <p className="mb-4 text-sm text-muted-foreground">Share of total sales</p>
          <ChartContainer config={{}} className="mx-auto h-48 w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="category" />} />
              <Pie data={CATEGORY_SPLIT} dataKey="value" nameKey="category" innerRadius={45} strokeWidth={2}>
                {CATEGORY_SPLIT.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="mt-2 space-y-1">
            {CATEGORY_SPLIT.map((c, i) => (
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

      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Orders per Month</h2>
        <p className="mb-4 text-sm text-muted-foreground">Order volume trend</p>
        <ChartContainer config={ordersConfig} className="h-56 w-full">
          <BarChart data={SALES_BY_MONTH} margin={{ left: 4, right: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>

      {/* Recent orders */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="font-semibold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">Order ID</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_ORDERS.slice(0, 6).map((o) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="px-5 py-3 font-medium">#{o.id}</td>
                  <td className="px-5 py-3">{o.address.fullName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(o.placedAt)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={statusVariant[o.status]} className="capitalize">
                      {o.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right font-medium">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
