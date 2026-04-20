"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckCircle, MapPin, CreditCard, ChevronRight, Truck } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { usePlaceOrder } from "@/hooks/useOrders";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import Link from "next/link";

type Step = "address" | "summary" | "success";

interface AddressForm {
  name: string; phone: string; street: string; area: string;
  city: string; district: string; postalCode: string;
}

const DHAKA_AREAS = ["ধানমন্ডি","মিরপুর","উত্তরা","গুলশান","বনানী","মোহাম্মদপুর","রামপুরা","বাড্ডা","নারায়ণগঞ্জ","গাজীপুর"];
const DISTRICTS = ["ঢাকা","চট্টগ্রাম","রাজশাহী","খুলনা","সিলেট","ময়মনসিংহ","বরিশাল","রংপুর"];

export default function CheckoutPage() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const { data: cart } = useCart();
  const placeOrder = usePlaceOrder();
  const [step, setStep] = useState<Step>("address");
  const [paymentMethod, setPaymentMethod] = useState<"cod">("cod");
  const [orderId, setOrderId] = useState<string | null>(null);

  const [form, setForm] = useState<AddressForm>({
    name: profile?.name ?? "",
    phone: profile?.phone ?? "",
    street: "", area: "", city: "ঢাকা", district: "ঢাকা", postalCode: "",
  });
  const [errors, setErrors] = useState<Partial<AddressForm>>({});

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold mb-4">চেকআউট করতে লগইন করুন</h2>
        <Link href="/login" className="btn-primary">লগইন করুন</Link>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingFee = subtotal >= 500 ? 0 : 60;
  const total = subtotal + shippingFee;

  const validate = () => {
    const e: Partial<AddressForm> = {};
    if (!form.name.trim()) e.name = "নাম দিন";
    if (!/^01[3-9]\d{8}$/.test(form.phone)) e.phone = "সঠিক মোবাইল নম্বর দিন";
    if (!form.street.trim()) e.street = "রাস্তার ঠিকানা দিন";
    if (!form.area.trim()) e.area = "এলাকা দিন";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmitAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setStep("summary");
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) { toast.error("কার্ট খালি"); return; }
    placeOrder.mutate(
      { shippingAddress: form, paymentMethod },
      {
        onSuccess: (order) => {
          setOrderId(order.orderNumber);
          setStep("success");
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "অর্ডার দেওয়া যায়নি";
          toast.error(msg);
        },
      }
    );
  };

  const STEPS = [
    { key: "address", label: "ঠিকানা",    icon: MapPin },
    { key: "summary", label: "সারসংক্ষেপ", icon: CreditCard },
  ];

  if (step === "success") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="card p-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">অর্ডার সফল!</h1>
          <p className="text-gray-500 mb-1">আপনার অর্ডার নম্বর</p>
          <p className="text-brand-700 font-bold text-xl mb-6">{orderId}</p>
          <p className="text-gray-500 text-sm mb-8">
            আমরা শীঘ্রই আপনার অর্ডার প্রক্রিয়া করব। ডেলিভারি হলে আমরা আপনাকে জানাব।
          </p>
          <div className="flex gap-3">
            <Link href="/orders" className="btn-primary flex-1">অর্ডার দেখুন</Link>
            <Link href="/products" className="btn-outline flex-1">কেনাকাটা চালিয়ে যান</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">চেকআউট</h1>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors
                ${step === s.key ? "bg-brand-600 text-white" : (step === "summary" && i === 0) ? "bg-brand-100 text-brand-700" : "bg-gray-100 text-gray-400"}`}>
                {(step === "summary" && i === 0) ? <CheckCircle className="w-5 h-5" /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${step === s.key ? "text-brand-700" : "text-gray-400"}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-0.5 mx-3 bg-gray-200" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left panel */}
        <div className="lg:col-span-2">
          {step === "address" && (
            <form onSubmit={handleSubmitAddress} className="card p-6 space-y-5">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-600" /> ডেলিভারি ঠিকানা
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">সম্পূর্ণ নাম *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`input-field ${errors.name ? "border-red-400" : ""}`} placeholder="আপনার নাম" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">মোবাইল নম্বর *</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={`input-field ${errors.phone ? "border-red-400" : ""}`} placeholder="01XXXXXXXXX" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">বাড়ি/রোড/ব্লক *</label>
                <input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })}
                  className={`input-field ${errors.street ? "border-red-400" : ""}`} placeholder="বাড়ি নং, রোড, ব্লক" />
                {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">এলাকা *</label>
                  <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}
                    list="areas" className={`input-field ${errors.area ? "border-red-400" : ""}`} placeholder="এলাকা লিখুন" />
                  <datalist id="areas">{DHAKA_AREAS.map(a => <option key={a} value={a} />)}</datalist>
                  {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">শহর</label>
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="input-field" placeholder="শহর" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">জেলা</label>
                  <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="input-field">
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">পোস্টাল কোড</label>
                  <input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                    className="input-field" placeholder="যেমন: ১২০৫" />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                পরবর্তী ধাপ <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === "summary" && (
            <div className="space-y-5">
              {/* Address summary */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-600" /> ডেলিভারি ঠিকানা
                  </h2>
                  <button onClick={() => setStep("address")} className="text-sm text-brand-600 hover:underline">পরিবর্তন</button>
                </div>
                <div className="text-sm text-gray-600 space-y-0.5">
                  <p className="font-semibold text-gray-800">{form.name}</p>
                  <p>{form.phone}</p>
                  <p>{form.street}, {form.area}</p>
                  <p>{form.city}, {form.district} {form.postalCode}</p>
                </div>
              </div>

              {/* Payment method */}
              <div className="card p-5">
                <h2 className="font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-brand-600" /> পেমেন্ট পদ্ধতি
                </h2>
                <label className="flex items-center gap-3 p-3 border-2 border-brand-500 bg-brand-50 rounded-xl cursor-pointer">
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="text-brand-600" />
                  <div>
                    <p className="font-semibold text-sm text-gray-800">ক্যাশ অন ডেলিভারি</p>
                    <p className="text-xs text-gray-500">পণ্য পেলে টাকা দিন</p>
                  </div>
                  <span className="ml-auto badge-green">পরিচিত পদ্ধতি</span>
                </label>
                <p className="text-xs text-gray-400 mt-3 text-center">
                  অনলাইন পেমেন্ট (SSLCommerz) শীঘ্রই আসছে
                </p>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placeOrder.isPending}
                className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2"
              >
                {placeOrder.isPending ? (
                  <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />প্রক্রিয়া হচ্ছে...</>
                ) : (
                  <><CheckCircle className="w-5 h-5" />অর্ডার নিশ্চিত করুন (৳{total})</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="card p-5 h-fit sticky top-20">
          <h2 className="font-bold text-base mb-4">অর্ডার সারসংক্ষেপ ({items.length})</h2>
          <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.product._id} className="flex gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                  <Image src={item.product.images?.[0] ?? "/placeholder.jpg"} alt={item.name} fill className="object-cover" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 line-clamp-2 leading-tight">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.unit} × {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-800 flex-shrink-0">৳{item.price * item.quantity}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>সাবটোটাল</span><span>৳{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>ডেলিভারি</span>
              <span className={shippingFee === 0 ? "text-green-600 font-medium" : ""}>
                {shippingFee === 0 ? "বিনামূল্যে" : `৳${shippingFee}`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
              <span>মোট</span>
              <span className="text-brand-700">৳{total}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl">
            <Truck className="w-3.5 h-3.5 text-brand-500" />
            ২–৪ ঘণ্টার মধ্যে ডেলিভারি
          </div>
        </div>
      </div>
    </div>
  );
}
