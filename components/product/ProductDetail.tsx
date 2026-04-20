"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Star, ChevronLeft, Plus, Minus, Package, Truck, RotateCcw } from "lucide-react";
import { useProduct } from "@/hooks/useProducts";
import { useProducts } from "@/hooks/useProducts";
import { useAddToCart } from "@/hooks/useCart";
import { useToggleWishlist, useWishlist } from "@/hooks/useOrders";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import ProductCard from "./ProductCard";
import toast from "react-hot-toast";

export default function ProductDetail({ slug }: { slug: string }) {
  const { data: product, isLoading } = useProduct(slug);
  const { profile } = useAuthStore();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const { data: wishlist } = useWishlist();

  const isWished = wishlist?.products?.some(
    (p: { _id: string } | string) => (typeof p === "object" ? p._id : p) === product?._id
  );

  const { data: related } = useProducts({
    category: product?.category?._id,
    limit: 4,
  });

  if (isLoading) return <ProductDetailSkeleton />;
  if (!product) return (
    <div className="text-center py-24">
      <p className="text-5xl mb-4">😞</p>
      <h2 className="font-bold text-xl text-gray-700 mb-2">পণ্য পাওয়া যায়নি</h2>
      <Link href="/products" className="btn-primary mt-4 inline-flex">সব পণ্য দেখুন</Link>
    </div>
  );

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!profile) { toast.error("আগে লগইন করুন"); router.push("/login"); return; }
    if (product.quantity === 0) return;
    addToCart.mutate({ productId: product._id, quantity: qty });
  };

  const handleBuyNow = async () => {
    if (!profile) { toast.error("আগে লগইন করুন"); router.push("/login"); return; }
    addToCart.mutate({ productId: product._id, quantity: qty }, {
      onSuccess: () => router.push("/cart"),
    });
  };

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand-600">হোম</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-brand-600">পণ্য</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category?._id}`} className="hover:text-brand-600">
          {product.category?.name}
        </Link>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 mb-14">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
            <Image
              src={product.images[activeImg] ?? "/placeholder.jpg"}
              alt={product.name}
              fill
              className="object-contain p-4"
              priority
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white font-bold text-sm px-3 py-1 rounded-xl">
                -{discount}% ছাড়
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-colors
                    ${activeImg === i ? "border-brand-500" : "border-gray-100 hover:border-gray-300"}`}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <span className="badge-green">{product.category?.name}</span>
            <button
              onClick={() => { if (!profile) { toast.error("আগে লগইন করুন"); return; } toggleWishlist.mutate(product._id); }}
              className={`p-2 rounded-xl border transition-colors ${isWished ? "bg-red-50 border-red-200 text-red-500" : "border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200"}`}
            >
              <Heart className={`w-5 h-5 ${isWished ? "fill-red-500" : ""}`} />
            </button>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-3 leading-snug">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
              ))}
            </div>
            <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-sm text-gray-400">({product.reviewCount} রিভিউ)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-brand-700">
              ৳{product.discountPrice ?? product.price}
            </span>
            {product.discountPrice && (
              <span className="text-xl text-gray-400 line-through">৳{product.price}</span>
            )}
            <span className="text-gray-500">/{product.unit}</span>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-4 h-4 text-gray-400" />
            {product.quantity > 0 ? (
              <span className="text-sm text-gray-600">
                স্টকে আছে:
                <span className={`font-semibold ml-1 ${product.quantity <= 5 ? "text-orange-600" : "text-green-600"}`}>
                  {product.quantity} {product.unit}
                  {product.quantity <= 5 && " (শেষ হওয়ার পথে)"}
                </span>
              </span>
            ) : (
              <span className="text-sm text-red-600 font-semibold">স্টক শেষ</span>
            )}
          </div>

          {/* Quantity selector */}
          {product.quantity > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700">পরিমাণ:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-2 hover:bg-gray-50 transition-colors disabled:opacity-40"
                  disabled={qty <= 1}>
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 py-2 font-semibold text-gray-800 min-w-[3rem] text-center">{qty}</span>
                <button onClick={() => setQty(Math.min(product.quantity, qty + 1))}
                  className="px-3 py-2 hover:bg-gray-50 transition-colors disabled:opacity-40"
                  disabled={qty >= product.quantity}>
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.quantity === 0 || addToCart.isPending}
              className="btn-outline flex-1 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              কার্টে যোগ
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.quantity === 0}
              className="btn-primary flex-1"
            >
              এখনই কিনুন
            </button>
          </div>

          {/* Delivery info */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            {[
              { icon: Truck,       text: "ঢাকার মধ্যে ২–৪ ঘণ্টায় ডেলিভারি" },
              { icon: RotateCcw,   text: "৭ দিনের মধ্যে ঝামেলামুক্ত রিটার্ন" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
                <Icon className="w-4 h-4 text-brand-500 flex-shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="card p-6 mb-10">
        <h2 className="font-bold text-lg text-gray-800 mb-4">পণ্যের বিবরণ</h2>
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {product.tags.map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Related products */}
      {related?.data && related.data.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-5">একই বিভাগের পণ্য</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {related.data.filter((p) => p._id !== product._id).slice(0, 4).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div className="space-y-3">
        <div className="aspect-square skeleton rounded-2xl" />
        <div className="flex gap-2">{[1,2,3].map(i=><div key={i} className="w-16 h-16 skeleton rounded-xl"/>)}</div>
      </div>
      <div className="space-y-4">
        <div className="h-5 w-20 skeleton rounded-full" />
        <div className="h-8 skeleton rounded" />
        <div className="h-6 w-32 skeleton rounded" />
        <div className="h-10 w-40 skeleton rounded" />
        <div className="h-12 skeleton rounded-xl" />
        <div className="flex gap-3">
          <div className="h-12 flex-1 skeleton rounded-xl" />
          <div className="h-12 flex-1 skeleton rounded-xl" />
        </div>
      </div>
    </div>
  );
}
