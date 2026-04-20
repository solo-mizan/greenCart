import type { Metadata } from "next";
import ProductDetail from "@/components/product/ProductDetail";

export const metadata: Metadata = { title: "পণ্যের বিবরণ" };

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ProductDetail slug={slug} />
    </div>
  );
}
