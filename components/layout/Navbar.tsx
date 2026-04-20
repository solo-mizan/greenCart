"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ShoppingCart, Heart, Search, Menu, X,
  User, LogOut, LayoutDashboard, Package, ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCartCount } from "@/hooks/useCart";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout, loading } = useAuthStore();
  const cartCount = useCartCount();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
    }
  };

  const navLinks = [
    { href: "/", label: "হোম" },
    { href: "/products", label: "পণ্যসমূহ" },
    { href: "/products?category=vegetables", label: "সবজি" },
    { href: "/products?category=fruits", label: "ফলমূল" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              গ্র
            </div>
            <span className="font-bold text-xl text-brand-700 hidden sm:block">গ্রিনকার্ট</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 mx-4">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${pathname === l.href
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:text-brand-600 hover:bg-gray-50"
                  }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Search — desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="পণ্য খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto md:ml-0">
            {/* Wishlist */}
            {profile && (
              <Link href="/wishlist" className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
                <Heart className="w-5 h-5" />
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-600 text-white
                                 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {loading ? (
              <div className="w-8 h-8 rounded-full skeleton" />
            ) : profile ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {profile.avatar ? (
                    <Image src={profile.avatar} alt={profile.name} width={28} height={28} className="rounded-full" />
                  ) : (
                    <div className="w-7 h-7 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-sm font-semibold">
                      {profile.name[0]}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 hidden lg:block max-w-[80px] truncate">
                    {profile.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-20">
                      <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="font-semibold text-sm">{profile.name}</p>
                        <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                      </div>
                      {[
                        { href: "/account", icon: User, label: "আমার অ্যাকাউন্ট" },
                        { href: "/orders", icon: Package, label: "আমার অর্ডার" },
                      ].map(({ href, icon: Icon, label }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Icon className="w-4 h-4 text-gray-400" /> {label}
                        </Link>
                      ))}
                      {profile.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-700 hover:bg-brand-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" /> অ্যাডমিন প্যানেল
                        </Link>
                      )}
                      <div className="border-t border-gray-50 mt-1">
                        <button
                          onClick={async () => { await logout(); setUserMenuOpen(false); router.push("/"); }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> লগ আউট
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login" className="btn-ghost text-sm py-2">লগইন</Link>
                <Link href="/register" className="btn-primary text-sm py-2">নিবন্ধন</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-gray-100 space-y-2">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="পণ্য খুঁজুন..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50"
              />
            </form>
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {l.label}
              </Link>
            ))}
            {!profile && (
              <div className="flex gap-2 pt-2">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-outline flex-1 text-center text-sm">লগইন</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 text-center text-sm">নিবন্ধন</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
