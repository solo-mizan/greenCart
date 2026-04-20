"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useOrders";
import { useAuthStore } from "@/store/authStore";
import ProductCard from "./ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeletons";
import type { Product } from "@/hooks/useProducts";

export default function WishlistPage() {
  const { profile } = useAuthStore();
  const { data: wishlist, isLoading } = useWishlist();

  if (!profile) return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-center">
      <h2 className="text-xl font-bold mb-4">উইশলিস্ট দেখতে লগইন করুন</h2>
      <Link href="/login" className="btn-primary">লগইন করুন</Link>
    </div>
  );

  const products: Product[] = wishlist?.products ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        আমার উইশলিস্ট
        {products.length > 0 && <span className="text-brand-600 ml-2">({products.length})</span>}
      </h1>

      {isLoading ? (
        <ProductGridSkeleton count={8} />
      ) : products.length === 0 ? (
        <div className="text-center py-24 card">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="font-bold text-xl text-gray-700 mb-2">উইশলিস্ট খালি</h2>
          <p className="text-gray-400 mb-6">পছন্দের পণ্যে হার্ট আইকনে ক্লিক করুন</p>
          <Link href="/products" className="btn-primary">পণ্য দেখুন</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
