"use client";
import Link from "next/link";
import { Package, ChevronRight, XCircle } from "lucide-react";
import { useOrders, useCancelOrder, Order } from "@/hooks/useOrders";
import { useAuthStore } from "@/store/authStore";
import OrderStatusBadge from "@/components/ui/OrderStatusBadge";
import { OrderSkeleton } from "@/components/ui/Skeletons";
import { format } from "date-fns";
import { useState } from "react";

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrdersPage() {
  const { profile } = useAuthStore();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOrders(page);
  const cancelOrder = useCancelOrder();

  if (!profile) return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-center">
      <h2 className="text-xl font-bold mb-4">অর্ডার দেখতে লগইন করুন</h2>
      <Link href="/login" className="btn-primary">লগইন করুন</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">আমার অর্ডার</h1>

      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i=><OrderSkeleton key={i}/>)}</div>
      ) : !data?.data.length ? (
        <div className="text-center py-24 card">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="font-bold text-xl text-gray-700 mb-2">কোনো অর্ডার নেই</h2>
          <p className="text-gray-400 mb-6">এখনো কোনো অর্ডার করা হয়নি</p>
          <Link href="/products" className="btn-primary">কেনাকাটা শুরু করুন</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data.data.map((order: Order) => (
            <OrderCard
              key={order._id}
              order={order}
              onCancel={(id) => cancelOrder.mutate({ id })}
              cancelling={cancelOrder.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onCancel, cancelling }: { order: Order; onCancel: (id: string) => void; cancelling: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="card overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="font-bold text-gray-800">{order.orderNumber}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Progress bar — only for non-cancelled */}
        {order.status !== "cancelled" && (
          <div className="mb-4">
            <div className="flex justify-between mb-1.5">
              {STATUS_STEPS.map((s, i) => (
                <div key={s} className={`flex-1 h-1.5 rounded-full mx-0.5 transition-colors
                  ${i <= currentStep ? "bg-brand-500" : "bg-gray-100"}`} />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 px-0.5">
              <span>অপেক্ষমাণ</span><span>নিশ্চিত</span><span>প্রক্রিয়া</span><span>পাঠানো</span><span>পৌঁছেছে</span>
            </div>
          </div>
        )}

        {/* Summary row */}
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-500">{(order.items as unknown[]).length}টি পণ্য • </span>
            <span className="font-bold text-brand-700">৳{order.total}</span>
            <span className="text-xs text-gray-400 ml-1">({order.paymentMethod === "cod" ? "ক্যাশ অন ডেলিভারি" : "অনলাইন"})</span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            বিবরণ
            <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-50 bg-gray-50/50 p-5 space-y-4">
          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">পণ্যসমূহ</p>
            <div className="space-y-2">
              {(order.items as { name: string; quantity: number; price: number; unit: string }[]).map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.name} ({item.unit} × {item.quantity})</span>
                  <span className="font-medium">৳{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">ডেলিভারি ঠিকানা</p>
            <p className="text-sm text-gray-600">
              {order.shippingAddress.name} • {order.shippingAddress.phone}<br />
              {order.shippingAddress.street}, {order.shippingAddress.area}, {order.shippingAddress.city}
            </p>
          </div>

          {/* Cancel button */}
          {["pending", "confirmed"].includes(order.status) && (
            <button
              onClick={() => onCancel(order._id)}
              disabled={cancelling}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" /> অর্ডার বাতিল করুন
            </button>
          )}
        </div>
      )}
    </div>
  );
}
