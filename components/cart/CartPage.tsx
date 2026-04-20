"use client";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useCart, useAddToCart, useRemoveFromCart, useClearCart, CartItem } from "@/hooks/useCart";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

const SHIPPING_FEE = 60;
const FREE_SHIPPING_THRESHOLD = 500;

export default function CartPage() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const { data: cart, isLoading } = useCart();
  const addToCart = useAddToCart();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">কার্ট দেখতে লগইন করুন</h2>
        <p className="text-gray-400 mb-6">আপনার পছন্দের পণ্য কার্টে যোগ করতে আগে লগইন করুন</p>
        <Link href="/login" className="btn-primary">লগইন করুন</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-8 w-32 skeleton rounded mb-6" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1,2,3].map(i => <div key={i} className="card p-4 h-28 skeleton" />)}
          </div>
          <div className="card p-5 h-72 skeleton" />
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingFee = subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? SHIPPING_FEE : 0;
  const total = subtotal + shippingFee;
  const toFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">আমার কার্ট</h1>
        <div className="text-center py-24 card">
          <ShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-5" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">কার্ট এখন খালি</h2>
          <p className="text-gray-400 mb-7">পছন্দের পণ্য কার্টে যোগ করুন</p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" /> কেনাকাটা শুরু করুন
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          আমার কার্ট <span className="text-brand-600">({items.length})</span>
        </h1>
        <button
          onClick={() => clearCart.mutate()}
          className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" /> সব মুছুন
        </button>
      </div>

      {/* Free shipping progress */}
      {toFreeShipping > 0 && (
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-brand-700 text-sm font-medium mb-2">
            <Tag className="w-4 h-4" />
            আরও ৳{toFreeShipping} কিনলে ফ্রি ডেলিভারি পাবেন!
          </div>
          <div className="h-2 bg-brand-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-600 rounded-full transition-all"
              style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item: CartItem) => (
            <CartItemRow
              key={item.product._id}
              item={item}
              onIncrease={() => addToCart.mutate({ productId: item.product._id, quantity: item.quantity + 1 })}
              onDecrease={() => {
                if (item.quantity === 1) removeFromCart.mutate(item.product._id);
                else addToCart.mutate({ productId: item.product._id, quantity: item.quantity - 1 });
              }}
              onRemove={() => removeFromCart.mutate(item.product._id)}
            />
          ))}
        </div>

        {/* Order summary */}
        <div className="card p-5 h-fit sticky top-20">
          <h2 className="font-bold text-lg text-gray-800 mb-5">অর্ডার সারসংক্ষেপ</h2>

          <div className="space-y-3 text-sm mb-5">
            <div className="flex justify-between text-gray-600">
              <span>সাবটোটাল ({items.length}টি পণ্য)</span>
              <span className="font-medium">৳{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>ডেলিভারি চার্জ</span>
              {shippingFee === 0 ? (
                <span className="font-medium text-green-600">বিনামূল্যে</span>
              ) : (
                <span className="font-medium">৳{shippingFee}</span>
              )}
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base">
              <span>মোট</span>
              <span className="text-brand-700 text-lg">৳{total}</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/checkout")}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            চেকআউট করুন <ArrowRight className="w-4 h-4" />
          </button>

          <Link href="/products" className="block text-center text-sm text-brand-600 hover:text-brand-700 mt-4">
            ← কেনাকাটা চালিয়ে যান
          </Link>

          <div className="mt-5 p-3 bg-gray-50 rounded-xl text-xs text-gray-500 text-center">
            ক্যাশ অন ডেলিভারি উপলব্ধ • নিরাপদ পেমেন্ট
          </div>
        </div>
      </div>
    </div>
  );
}

interface RowProps {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

function CartItemRow({ item, onIncrease, onDecrease, onRemove }: RowProps) {
  return (
    <div className="card flex gap-4 p-4">
      <Link href={`/products/${item.product._id}`} className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
        <Image src={item.product.images?.[0] ?? "/placeholder.jpg"} alt={item.name} fill className="object-cover" />
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.product._id}`} className="font-semibold text-gray-800 text-sm hover:text-brand-600 line-clamp-2 leading-snug">
          {item.name}
        </Link>
        <p className="text-xs text-gray-400 mt-0.5">প্রতি {item.unit}: ৳{item.price}</p>
        {item.product.quantity <= 5 && item.product.quantity > 0 && (
          <p className="text-xs text-orange-500 mt-0.5">মাত্র {item.product.quantity}টি বাকি</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={onDecrease} className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-3.5 py-1.5 text-sm font-semibold min-w-[2.5rem] text-center">{item.quantity}</span>
            <button
              onClick={onIncrease}
              disabled={item.quantity >= item.product.quantity}
              className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold text-brand-700">৳{item.price * item.quantity}</span>
            <button onClick={onRemove} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
