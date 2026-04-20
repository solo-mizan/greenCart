"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAxios } from "@/store/authStore";
import { Search, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import OrderStatusBadge from "@/components/ui/OrderStatusBadge";
import toast from "react-hot-toast";

type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

interface AdminOrder {
  _id: string; orderNumber: string; status: OrderStatus; total: number;
  paymentMethod: string; paymentStatus: string; createdAt: string;
  user: { name: string; email: string; phone?: string };
  items: { name: string; quantity: number; price: number; unit: string }[];
  shippingAddress: { name: string; phone: string; street: string; area: string; city: string };
}

const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  pending:    ["confirmed", "cancelled"],
  confirmed:  ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped:    ["delivered"],
  delivered:  [],
  cancelled:  [],
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "অপেক্ষমাণ", confirmed: "নিশ্চিত", processing: "প্রক্রিয়াধীন",
  shipped: "পাঠানো হয়েছে", delivered: "পৌঁছে গেছে", cancelled: "বাতিল",
};

const FILTER_TABS: { value: string; label: string }[] = [
  { value: "", label: "সব" },
  { value: "pending", label: "অপেক্ষমাণ" },
  { value: "confirmed", label: "নিশ্চিত" },
  { value: "processing", label: "প্রক্রিয়াধীন" },
  { value: "shipped", label: "পাঠানো" },
  { value: "delivered", label: "ডেলিভার" },
  { value: "cancelled", label: "বাতিল" },
];

export default function AdminOrdersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", page, statusFilter, search],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      return authAxios.get(`/admin/orders?${params}`).then((r) => r.data);
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note?: string }) =>
      authAxios.patch(`/orders/${id}/status`, { status, note }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("স্ট্যাটাস আপডেট হয়েছে");
    },
    onError: () => toast.error("স্ট্যাটাস আপডেট ব্যর্থ"),
  });

  return (
    <div className="max-w-7xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">অর্ডার ব্যবস্থাপনা</h1>
        <p className="text-sm text-gray-500">{data?.pagination?.total ?? 0}টি অর্ডার</p>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        {/* Status tabs */}
        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => { setStatusFilter(t.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors
                ${statusFilter === t.value
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-9" placeholder="অর্ডার নম্বর খুঁজুন (GC-XXXXXX)"
          />
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="card p-4 h-24 skeleton" />)
          : data?.data?.length === 0
          ? (
            <div className="card p-16 text-center text-gray-400">
              <p className="text-4xl mb-3">📦</p>
              <p>এই বিভাগে কোনো অর্ডার নেই</p>
            </div>
          )
          : data?.data?.map((order: AdminOrder) => (
              <AdminOrderCard
                key={order._id}
                order={order}
                expanded={expandedId === order._id}
                onToggle={() => setExpandedId(expandedId === order._id ? null : order._id)}
                onStatusChange={(status, note) =>
                  updateStatus.mutate({ id: order._id, status, note })
                }
                updating={updateStatus.isPending}
              />
            ))}
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}
            className="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 text-sm">
            ← আগের
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {page} / {data.pagination.totalPages}
          </span>
          <button disabled={!data.pagination.hasNext} onClick={() => setPage(page + 1)}
            className="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 text-sm">
            পরের →
          </button>
        </div>
      )}
    </div>
  );
}

function AdminOrderCard({ order, expanded, onToggle, onStatusChange, updating }: {
  order: AdminOrder;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: string, note?: string) => void;
  updating: boolean;
}) {
  const nextStatuses = STATUS_FLOW[order.status];

  return (
    <div className="card overflow-hidden">
      {/* Header row */}
      <div className="p-4 flex flex-wrap items-center gap-3 cursor-pointer hover:bg-gray-50/50" onClick={onToggle}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-sm text-brand-700">{order.orderNumber}</span>
            <OrderStatusBadge status={order.status} />
            {order.paymentMethod === "cod" && (
              <span className="badge-gray">ক্যাশ অন ডেলিভারি</span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-0.5">
            <span className="font-medium">{order.user?.name}</span>
            <span className="text-gray-400 mx-1.5">•</span>
            {order.user?.email}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-gray-800">৳{order.total}</p>
          <p className="text-xs text-gray-400">{format(new Date(order.createdAt), "dd MMM yyyy")}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-50 bg-gray-50/30 p-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Items */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">পণ্যসমূহ</p>
              <div className="space-y-1.5">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.name} ({item.unit} × {item.quantity})</span>
                    <span className="font-medium">৳{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping address */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">ডেলিভারি ঠিকানা</p>
              <div className="text-sm text-gray-600 space-y-0.5">
                <p className="font-medium text-gray-800">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.phone}</p>
                <p>{order.shippingAddress?.street}, {order.shippingAddress?.area}</p>
                <p>{order.shippingAddress?.city}</p>
              </div>
            </div>
          </div>

          {/* Status update actions */}
          {nextStatuses.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">স্ট্যাটাস পরিবর্তন</p>
              <div className="flex flex-wrap gap-2">
                {nextStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => onStatusChange(s)}
                    disabled={updating}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors
                      ${s === "cancelled"
                        ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                        : "bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200"
                      } disabled:opacity-50`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
