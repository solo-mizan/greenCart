"use client";
import Link from "next/link";
import { ArrowRight, Truck, ShieldCheck, Clock } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-14 md:py-20 relative z-10">
        <div className="max-w-2xl">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm
                          px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
            প্রতিদিন সকালে তাজা সংগ্রহ
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5">
            তাজা মুদিপণ্য <br />
            <span className="text-yellow-300">দরজায় পৌঁছে দিই</span>
          </h1>

          <p className="text-lg text-brand-100 leading-relaxed mb-8 max-w-lg">
            সরাসরি কৃষক থেকে আপনার রান্নাঘরে। সবজি, ফলমূল, দুগ্ধজাত পণ্য — সবকিছু এক জায়গায়।
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="flex items-center gap-2 bg-white text-brand-700
                             hover:bg-brand-50 font-semibold px-6 py-3 rounded-xl transition-all
                             shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              এখনই কেনাকাটা করুন <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/products?featured=true"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm
                         font-semibold px-6 py-3 rounded-xl transition-all border border-white/30">
              অফার দেখুন
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-5 mt-10">
            {[
              { icon: Truck, text: "৳৫০০+ অর্ডারে ফ্রি ডেলিভারি" },
              { icon: Clock, text: "২-৪ ঘণ্টার মধ্যে ডেলিভারি" },
              { icon: ShieldCheck, text: "১০০% তাজা গ্যারান্টি" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-brand-100">
                <Icon className="w-4 h-4 text-yellow-300" /> {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 40" className="fill-gray-50 w-full">
          <path d="M0,20 C480,40 960,0 1440,20 L1440,40 L0,40 Z" />
        </svg>
      </div>
    </section>
  );
}
