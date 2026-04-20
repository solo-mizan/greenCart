import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import PromoBanner from "@/components/home/PromoBanner";

export const metadata: Metadata = { title: "গ্রিনকার্ট – তাজা মুদির দোকান" };

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-14">
        <CategoryGrid />
        <FeaturedProducts />
        <PromoBanner />
        <WhyChooseUs />
      </div>
    </>
  );
}
