"use client";
import Link from "next/link";
import { useCategories } from "@/hooks/useProducts";
import { Leaf } from "lucide-react";

const CATEGORY_COLORS = [
  "bg-green-50 text-green-700",
  "bg-orange-50 text-orange-700",
  "bg-blue-50 text-blue-700",
  "bg-purple-50 text-purple-700",
  "bg-yellow-50 text-yellow-700",
  "bg-pink-50 text-pink-700",
  "bg-teal-50 text-teal-700",
  "bg-red-50 text-red-700",
];

export default function CategoryGrid() {
  const { data: categories, isLoading } = useCategories();

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">বিভাগ অনুযায়ী কিনুন</h2>
          <p className="text-gray-500 text-sm mt-1">আপনার পছন্দের বিভাগ বেছে নিন</p>
        </div>
        <Link href="/products" className="text-brand-600 hover:text-brand-700 text-sm font-medium flex items-center gap-1">
          সব দেখুন →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton rounded-2xl h-24" />
            ))
          : categories?.map((cat, i) => (
              <Link
                key={cat._id}
                href={`/products?category=${cat._id}`}
                className={`${CATEGORY_COLORS[i % CATEGORY_COLORS.length]} rounded-2xl p-4 flex flex-col
                             items-center gap-2 hover:shadow-md transition-all hover:-translate-y-0.5 text-center`}
              >
                <div className="text-2xl">{cat.icon ?? "🛒"}</div>
                <span className="text-xs font-semibold leading-tight">{cat.name}</span>
              </Link>
            ))}
      </div>
    </section>
  );
}
