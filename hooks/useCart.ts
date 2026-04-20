"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAxios } from "@/store/authStore";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export interface CartItem {
  product: { _id: string; name: string; images: string[]; price: number; discountPrice?: number; unit: string; quantity: number };
  quantity: number;
  price: number;
  name: string;
  image: string;
  unit: string;
}
export interface Cart { items: CartItem[] }

export function useCart() {
  const { profile } = useAuthStore();
  return useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await authAxios.get("/cart");
      return data.data;
    },
    enabled: !!profile,
    staleTime: 10_000,
  });
}

export function useCartCount() {
  const { data } = useCart();
  return data?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { productId: string; quantity: number }) =>
      authAxios.post("/cart", vars).then((r) => r.data.data),
    onSuccess: (data) => {
      qc.setQueryData(["cart"], data);
      toast.success("কার্টে যোগ হয়েছে ✓");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "কার্টে যোগ করা যায়নি";
      toast.error(msg);
    },
  });
}

export function useRemoveFromCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) =>
      authAxios.delete(`/cart?productId=${productId}`).then((r) => r.data.data),
    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: ["cart"] });
      const prev = qc.getQueryData<Cart>(["cart"]);
      qc.setQueryData<Cart>(["cart"], (old) =>
        old ? { ...old, items: old.items.filter((i) => i.product._id !== productId) } : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(["cart"], ctx?.prev);
      toast.error("সরানো যায়নি");
    },
    onSuccess: () => toast.success("পণ্য সরানো হয়েছে"),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authAxios.delete("/cart").then((r) => r.data.data),
    onSuccess: () => qc.setQueryData(["cart"], { items: [] }),
  });
}
