import Link from "next/link";

export default function PromoBanner() {
  return (
    <section className="grid md:grid-cols-2 gap-4">
      <div className="relative bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-7 text-white overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute right-10 -top-4 w-20 h-20 bg-white/10 rounded-full" />
        <p className="text-sm font-medium opacity-90 mb-1">সীমিত অফার</p>
        <h3 className="text-2xl font-bold mb-2">প্রথম অর্ডারে <br />৳১০০ ছাড়</h3>
        <p className="text-sm opacity-85 mb-5">FIRSTORDER কোড ব্যবহার করুন</p>
        <Link href="/products" className="inline-flex bg-white text-orange-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-colors">
          অর্ডার করুন
        </Link>
      </div>
      <div className="relative bg-gradient-to-r from-brand-700 to-brand-500 rounded-2xl p-7 text-white overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full" />
        <p className="text-sm font-medium opacity-90 mb-1">প্রতিদিনের টাটকা</p>
        <h3 className="text-2xl font-bold mb-2">তাজা সবজি <br />সরাসরি কৃষক থেকে</h3>
        <p className="text-sm opacity-85 mb-5">প্রতিদিন সকালে সংগ্রহ করা হয়</p>
        <Link href="/products?category=vegetables" className="inline-flex bg-white text-brand-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-brand-50 transition-colors">
          সবজি দেখুন
        </Link>
      </div>
    </section>
  );
}
