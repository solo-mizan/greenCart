import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Toaster } from "react-hot-toast";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "গ্রিনকার্ট – তাজা মুদির দোকান", template: "%s | গ্রিনকার্ট" },
  description: "গ্রিনকার্ট থেকে তাজা সবজি, ফলমূল, দুগ্ধজাত পণ্য এবং আরো অনেক কিছু দ্রুত ডেলিভারিতে পান।",
  keywords: ["গ্রোসারি", "সবজি", "ফল", "অনলাইন শপিং", "ঢাকা", "বাংলাদেশ"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={hindSiliguri.variable}>
      <body className="font-bengali bg-gray-50 text-gray-800 antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: { fontFamily: "Hind Siliguri, sans-serif", fontSize: "15px" },
              success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
