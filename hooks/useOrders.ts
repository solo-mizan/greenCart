"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAxios } from "@/store/authStore";
import toast from "react-hot-toast";

export interface Order {
  _id: string; orderNumber: string; status: string; paymentMethod: string;
  paymentStatus: string; items: unknown[]; subtotal: number; shippingFee: number;
  total: number; shippingAddress: Record<string, string>;
  statusHistory: { status: string; timestamp: string }[];
  createdAt: string;
}

export function useOrders(page = 1) {
  return useQuery<{ data: Order[]; pagination: unknown }>({
    queryKey: ["orders", page],
    queryFn: () => authAxios.get(`/orders?page=${page}&limit=10`).then((r) => ({ data: r.data.data, pagination: r.data.pagination })),
    staleTime: 30_000,
  });
}

export function useOrder(id: string) {
  return useQuery<Order>({
    queryKey: ["order", id],
    queryFn: () => authAxios.get(`/orders/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => authAxios.post("/orders", body).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      authAxios.delete(`/orders/${id}`, { data: { reason } }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("অর্ডার বাতিল করা হয়েছে");
    },
  });
}

export function useWishlist() {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: () => authAxios.get("/wishlist").then((r) => r.data.data),
    staleTime: 60_000,
  });
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => authAxios.post("/wishlist", { productId }).then((r) => r.data.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(data.action === "added" ? "উইশলিস্টে যোগ হয়েছে ♥" : "উইশলিস্ট থেকে সরানো হয়েছে");
    },
  });
}
