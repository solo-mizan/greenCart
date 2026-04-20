"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag, Tag,
  LogOut, Menu, X, TrendingUp, Home,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";

const NAV = [
  { href: "/admin",             icon: LayoutDashboard, label: "ড্যাশবোর্ড" },
  { href: "/admin/products",    icon: Package,          label: "পণ্য ব্যবস্থাপনা" },
  { href: "/admin/orders",      icon: ShoppingBag,      label: "অর্ডার ব্যবস্থাপনা" },
  { href: "/admin/categories",  icon: Tag,              label: "বিভাগ ব্যবস্থাপনা" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!profile || profile.role !== "admin")) {
      router.replace("/");
    }
  }, [profile, loading, router]);

  if (loading || !profile || profile.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 flex flex-col transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 lg:flex`}>
          {/* Brand */}
          <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-800 flex-shrink-0">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold">গ্র</div>
            <div>
              <p className="font-bold text-white text-sm">গ্রিনকার্ট</p>
              <p className="text-xs text-gray-500">অ্যাডমিন প্যানেল</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <p className="text-xs font-semibold text-gray-500 uppercase px-3 mb-2">মেনু</p>
            {NAV.map(({ href, icon: Icon, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-colors
                    ${active
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="px-3 py-4 border-t border-gray-800 space-y-1">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
              <Home className="w-4 h-4" /> মূল সাইটে যান
            </Link>
            <button
              onClick={async () => { await logout(); router.push("/login"); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-950/30 w-full transition-colors"
            >
              <LogOut className="w-4 h-4" /> লগ আউট
            </button>
          </div>
        </aside>
      </>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 gap-4 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-gray-800 text-sm">
              {NAV.find((n) => n.href === pathname)?.label ?? "অ্যাডমিন"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-sm font-semibold">
              {profile.name[0]}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{profile.name}</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
