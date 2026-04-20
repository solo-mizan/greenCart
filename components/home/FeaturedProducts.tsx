"use client";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeletons";

export default function FeaturedProducts() {
  const { data, isLoading } = useProducts({ featured: true, limit: 8 });

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">বিশেষ অফার</h2>
          <p className="text-gray-500 text-sm mt-1">সীমিত সময়ের জন্য বিশেষ ছাড়</p>
        </div>
        <Link href="/products?featured=true" className="text-brand-600 hover:text-brand-700 text-sm font-medium">
          সব অফার দেখুন →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : data?.data.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>

      {!isLoading && (!data?.data.length) && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🌿</p>
          <p>এই মুহূর্তে কোনো অফার নেই</p>
        </div>
      )}
    </section>
  );
}
