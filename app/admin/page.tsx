"use client";
import { useQuery } from "@tanstack/react-query";
import { authAxios } from "@/store/authStore";
import {
  TrendingUp, ShoppingBag, Users, Package,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Clock,
} from "lucide-react";
import { format } from "date-fns";
import OrderStatusBadge from "@/components/ui/OrderStatusBadge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const MONTHS = ["জান","ফেব","মার","এপ্র","মে","জুন","জুল","আগ","সেপ","অক্ট","নভ","ডিস"];

interface Stats {
  orders: { total: number; pending: number; delivered: number; cancelled: number };
  users: number;
  products: { total: number; lowStock: number };
  revenue: { thisMonth: number; lastMonth: number; growth: string | null };
  recentOrders: {
    _id: string; orderNumber: string; status: string; total: number;
    createdAt: string; user: { name: string; email: string };
  }[];
  monthlyChart: { _id: number; orders: number; revenue: number }[];
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["admin-stats"],
    queryFn: () => authAxios.get("/admin/stats").then((r) => r.data.data),
    staleTime: 60_000,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (!stats) return null;

  const chartData = stats.monthlyChart.map((m) => ({
    name: MONTHS[m._id - 1],
    অর্ডার: m.orders,
    আয়: m.revenue,
  }));

  const STAT_CARDS = [
    {
      label: "এই মাসের আয়",
      value: `৳${stats.revenue.thisMonth.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-brand-50 text-brand-600",
      growth: stats.revenue.growth,
    },
    {
      label: "মোট অর্ডার",
      value: stats.orders.total.toLocaleString(),
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
      sub: `${stats.orders.pending} অপেক্ষমাণ`,
    },
    {
      label: "মোট গ্রাহক",
      value: stats.users.toLocaleString(),
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "সক্রিয় পণ্য",
      value: stats.products.total.toLocaleString(),
      icon: Package,
      color: "bg-orange-50 text-orange-600",
      warn: stats.products.lowStock > 0 ? `${stats.products.lowStock}টি কম স্টক` : undefined,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">ড্যাশবোর্ড</h1>
        <p className="text-gray-500 text-sm mt-1">গ্রিনকার্টের সামগ্রিক চিত্র</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, growth, sub, warn }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              {growth !== undefined && growth !== null && (
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
                  ${Number(growth) >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                  {Number(growth) >= 0
                    ? <ArrowUpRight className="w-3 h-3" />
                    : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(Number(growth))}%
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
            {sub && <p className="text-xs text-yellow-600 mt-1">{sub}</p>}
            {warn && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {warn}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Chart + Recent orders */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly chart */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-bold text-gray-800 mb-5">মাসিক অর্ডার ও আয়</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: "Hind Siliguri" }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ fontFamily: "Hind Siliguri", fontSize: 13, borderRadius: 12, border: "1px solid #e2e8f0" }}
                  formatter={(val, name) => [name === "আয়" ? `৳${val}` : val, name]}
                />
                <Bar dataKey="অর্ডার" fill="#86efac" radius={[4, 4, 0, 0]} />
                <Bar dataKey="আয়" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              এখনো পর্যাপ্ত ডেটা নেই
            </div>
          )}
        </div>

        {/* Order status summary */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 mb-5">অর্ডার স্ট্যাটাস</h2>
          <div className="space-y-3">
            {[
              { label: "অপেক্ষমাণ",   value: stats.orders.pending,   color: "bg-yellow-400" },
              { label: "ডেলিভার হয়েছে", value: stats.orders.delivered, color: "bg-green-500" },
              { label: "বাতিল",        value: stats.orders.cancelled, color: "bg-red-400" },
              {
                label: "প্রক্রিয়াধীন",
                value: stats.orders.total - stats.orders.pending - stats.orders.delivered - stats.orders.cancelled,
                color: "bg-blue-400",
              },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all`}
                    style={{ width: `${stats.orders.total > 0 ? (value / stats.orders.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <p className="text-3xl font-bold text-gray-800">{stats.orders.total}</p>
            <p className="text-sm text-gray-400">মোট অর্ডার</p>
          </div>
        </div>
      </div>

      {/* Recent orders table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-800">সাম্প্রতিক অর্ডার</h2>
          <a href="/admin/orders" className="text-sm text-brand-600 hover:underline">সব দেখুন →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-semibold">অর্ডার নং</th>
                <th className="pb-3 font-semibold">গ্রাহক</th>
                <th className="pb-3 font-semibold">মোট</th>
                <th className="pb-3 font-semibold">স্ট্যাটাস</th>
                <th className="pb-3 font-semibold">তারিখ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentOrders.map((o) => (
                <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-mono text-xs text-brand-700 font-semibold">{o.orderNumber}</td>
                  <td className="py-3">
                    <p className="font-medium text-gray-800 truncate max-w-[120px]">{o.user?.name}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[120px]">{o.user?.email}</p>
                  </td>
                  <td className="py-3 font-semibold text-gray-800">৳{o.total}</td>
                  <td className="py-3"><OrderStatusBadge status={o.status} /></td>
                  <td className="py-3 text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(o.createdAt), "dd/MM/yy")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.recentOrders.length === 0 && (
            <p className="text-center py-10 text-gray-400">কোনো অর্ডার নেই</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 skeleton rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="card p-5 h-32 skeleton" />)}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5 h-80 skeleton" />
        <div className="card p-5 h-80 skeleton" />
      </div>
    </div>
  );
}
