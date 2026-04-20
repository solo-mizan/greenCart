import type { Metadata } from "next";
import { Suspense } from "react";
import ProductsBrowse from "@/components/product/ProductsBrowse";
import { ProductGridSkeleton } from "@/components/ui/Skeletons";

export const metadata: Metadata = { title: "সব পণ্য" };

export default function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">সব পণ্য</h1>
        <p className="text-gray-500 text-sm mt-1">তাজা ও মানসম্পন্ন মুদিপণ্য কিনুন</p>
      </div>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductsBrowse />
      </Suspense>
    </div>
  );
}
