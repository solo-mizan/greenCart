import { Truck, ShieldCheck, Clock, Headphones, RotateCcw, Award } from "lucide-react";

const features = [
  { icon: Truck,       title: "দ্রুত ডেলিভারি",        desc: "ঢাকার মধ্যে ২–৪ ঘণ্টায় পৌঁছে দিই", color: "bg-blue-50 text-blue-600" },
  { icon: ShieldCheck, title: "নিরাপদ পেমেন্ট",        desc: "সম্পূর্ণ নিরাপদ ক্যাশ অন ডেলিভারি",  color: "bg-green-50 text-green-600" },
  { icon: Award,       title: "১০০% তাজা গ্যারান্টি",  desc: "টাটকা না হলে সম্পূর্ণ ফেরত",         color: "bg-yellow-50 text-yellow-600" },
  { icon: RotateCcw,   title: "সহজ রিটার্ন",           desc: "৭ দিনের মধ্যে ঝামেলামুক্ত রিটার্ন",  color: "bg-purple-50 text-purple-600" },
  { icon: Clock,       title: "৩৬৫ দিন চালু",          desc: "প্রতিদিন সকাল ৮টা থেকে রাত ১০টা",   color: "bg-orange-50 text-orange-600" },
  { icon: Headphones,  title: "সার্বক্ষণিক সাপোর্ট",   desc: "যেকোনো সমস্যায় আমরা পাশে আছি",     color: "bg-pink-50 text-pink-600" },
];

export default function WhyChooseUs() {
  return (
    <section>
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-800">কেন গ্রিনকার্ট বেছে নেবেন?</h2>
        <p className="text-gray-500 text-sm mt-2">আমরা শুধু পণ্য নয়, বিশ্বাস ডেলিভারি করি</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {features.map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="card p-5 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1.5">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
