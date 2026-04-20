"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Product } from "@/hooks/useProducts";
import { useAddToCart } from "@/hooks/useCart";
import { useToggleWishlist, useWishlist } from "@/hooks/useOrders";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props { product: Product; view?: "grid" | "list" }

export default function ProductCard({ product, view = "grid" }: Props) {
  const { profile } = useAuthStore();
  const router = useRouter();
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const { data: wishlist } = useWishlist();

  const isWished = wishlist?.products?.some(
    (p: { _id: string } | string) => (typeof p === "object" ? p._id : p) === product._id
  );

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!profile) { toast.error("আগে লগইন করুন"); router.push("/login"); return; }
    if (product.quantity === 0) { toast.error("স্টক শেষ"); return; }
    addToCart.mutate({ productId: product._id, quantity: 1 });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!profile) { toast.error("আগে লগইন করুন"); router.push("/login"); return; }
    toggleWishlist.mutate(product._id);
  };

  if (view === "list") {
    return (
      <Link href={`/products/${product.slug}`} className="card flex gap-4 p-4 hover:shadow-md transition-shadow">
        <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
          <Image src={product.images[0] ?? "/placeholder.jpg"} alt={product.name} fill className="object-cover" />
          {discount > 0 && (
            <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              -{discount}%
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-brand-600 font-medium mb-0.5">{product.category?.name}</p>
          <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-500">{product.rating.toFixed(1)} ({product.reviewCount})</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div>
              {product.discountPrice ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-brand-700 text-lg">৳{product.discountPrice}</span>
                  <span className="text-gray-400 line-through text-sm">৳{product.price}</span>
                </div>
              ) : (
                <span className="font-bold text-brand-700 text-lg">৳{product.price}</span>
              )}
              <span className="text-xs text-gray-400">/{product.unit}</span>
            </div>
            <button onClick={handleCart} disabled={product.quantity === 0 || addToCart.isPending}
              className="btn-primary text-sm py-2">
              কার্টে যোগ
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/products/${product.slug}`}
      className="card group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={product.images[0] ?? "/placeholder.jpg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
            -{discount}%
          </span>
        )}
        {product.quantity === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">স্টক শেষ</span>
          </div>
        )}
        {product.isFeatured && (
          <span className="absolute top-2 right-2 badge-green">অফার</span>
        )}
        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center
                     justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className={`w-4 h-4 ${isWished ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1">
        <p className="text-xs text-brand-600 font-medium mb-0.5 truncate">{product.category?.name}</p>
        <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 flex-1">{product.name}</h3>
        <div className="flex items-center gap-1 mt-1.5">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-gray-500">{product.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({product.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div>
            {product.discountPrice ? (
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-brand-700">৳{product.discountPrice}</span>
                <span className="text-gray-400 line-through text-xs">৳{product.price}</span>
              </div>
            ) : (
              <span className="font-bold text-brand-700">৳{product.price}</span>
            )}
            <span className="text-xs text-gray-400">/{product.unit}</span>
          </div>
          <button
            onClick={handleCart}
            disabled={product.quantity === 0 || addToCart.isPending}
            className="w-8 h-8 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 text-white
                       rounded-lg flex items-center justify-center transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
