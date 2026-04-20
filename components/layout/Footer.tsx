import Link from "next/link";
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold">গ্র</div>
              <span className="font-bold text-xl text-white">গ্রিনকার্ট</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              তাজা সবজি, ফলমূল ও মুদিপণ্য আপনার দরজায়। প্রতিদিন সকালে সংগ্রহ, দ্রুত ডেলিভারি।
            </p>
            <div className="flex gap-3 mt-5">
              {[Facebook, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-gray-800 hover:bg-brand-600 rounded-lg
                                               flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-white mb-4">দ্রুত লিঙ্ক</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ["পণ্যসমূহ", "/products"],
                ["সবজি", "/products?category=vegetables"],
                ["ফলমূল", "/products?category=fruits"],
                ["দুগ্ধজাত", "/products?category=dairy"],
                ["অফার", "/products?featured=true"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-brand-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-white mb-4">অ্যাকাউন্ট</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ["আমার অ্যাকাউন্ট", "/account"],
                ["অর্ডার ইতিহাস", "/orders"],
                ["উইশলিস্ট", "/wishlist"],
                ["লগইন", "/login"],
                ["নিবন্ধন", "/register"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-brand-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">যোগাযোগ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 text-brand-400 flex-shrink-0" />
                <span>৪৫ খড়খড়ি বাইপাস, পবা, রাজশাহী</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <a href="tel:01700000000" className="hover:text-brand-400">০১৭১৯-৪০২৯৩৩</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <a href="mailto:support@greencart.bd" className="hover:text-brand-400">support@greencart.bd</a>
              </li>
            </ul>
            <div className="mt-5 p-3 bg-gray-800 rounded-xl text-xs text-gray-400">
              <p className="font-medium text-gray-300 mb-1">সার্ভিস সময়</p>
              <p>সকাল ৮টা – রাত ১০টা (প্রতিদিন)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© ২০২৬ গ্রিনকার্ট। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300">গোপনীয়তা নীতি</a>
            <a href="#" className="hover:text-gray-300">শর্তাবলী</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
