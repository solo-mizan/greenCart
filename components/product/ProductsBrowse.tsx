"use client";
import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, LayoutGrid, List, X, ChevronDown } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useProducts";
import ProductCard from "./ProductCard";
import { ProductGridSkeleton } from "@/components/ui/Skeletons";
import Pagination from "@/components/ui/Pagination";

const SORT_OPTIONS = [
  { value: "newest",     label: "সর্বশেষ" },
  { value: "price_asc",  label: "দাম: কম থেকে বেশি" },
  { value: "price_desc", label: "দাম: বেশি থেকে কম" },
  { value: "rating",     label: "সেরা রেটিং" },
];

export default function ProductsBrowse() {
  const router = useRouter();
  const sp = useSearchParams();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);

  const page     = parseInt(sp.get("page") ?? "1");
  const search   = sp.get("search") ?? "";
  const category = sp.get("category") ?? "";
  const sort     = sp.get("sort") ?? "newest";
  const featured = sp.get("featured") === "true";
  const minPrice = sp.get("minPrice") ?? "";
  const maxPrice = sp.get("maxPrice") ?? "";

  const { data, isLoading } = useProducts({ page, search, category, sort, featured, minPrice: minPrice ? Number(minPrice) : undefined, maxPrice: maxPrice ? Number(maxPrice) : undefined });
  const { data: categories } = useCategories();

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }, [sp, router]);

  const clearFilters = () => router.push("/products");
  const hasFilters = !!(search || category || minPrice || maxPrice || featured);

  return (
    <div className="flex gap-6">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:block w-64 flex-shrink-0 space-y-5">
        <FilterPanel
          categories={categories ?? []}
          category={category}
          minPrice={minPrice}
          maxPrice={maxPrice}
          featured={featured}
          updateParam={updateParam}
        />
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4" />
            ফিল্টার
          </button>

          {/* Results count */}
          <p className="text-sm text-gray-500 flex-1">
            {isLoading ? "লোড হচ্ছে..." : `${data?.pagination.total ?? 0}টি পণ্য পাওয়া গেছে`}
          </p>

          {/* Active filters */}
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700">
              <X className="w-3.5 h-3.5" /> ফিল্টার মুছুন
            </button>
          )}

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* View toggle */}
          <div className="flex border border-gray-200 rounded-xl overflow-hidden">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`p-2 transition-colors ${view === v ? "bg-brand-600 text-white" : "hover:bg-gray-50 text-gray-500"}`}
              >
                {v === "grid" ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Search tag */}
        {search && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">অনুসন্ধান:</span>
            <span className="flex items-center gap-1.5 bg-brand-50 text-brand-700 text-sm font-medium px-3 py-1 rounded-full">
              {search}
              <button onClick={() => updateParam("search", "")}><X className="w-3.5 h-3.5" /></button>
            </span>
          </div>
        )}

        {/* Grid / List */}
        {isLoading ? (
          <ProductGridSkeleton count={12} />
        ) : !data?.data.length ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="font-semibold text-gray-700 mb-2">কোনো পণ্য পাওয়া যায়নি</h3>
            <p className="text-gray-400 text-sm mb-6">ভিন্ন কীওয়ার্ড বা ফিল্টার ব্যবহার করুন</p>
            <button onClick={clearFilters} className="btn-outline text-sm">সব দেখুন</button>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.data.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {data.data.map((p) => <ProductCard key={p._id} product={p} view="list" />)}
          </div>
        )}

        {data && (
          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            onPageChange={(p) => updateParam("page", String(p))}
          />
        )}
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setFilterOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-80 bg-white z-50 p-5 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">ফিল্টার</h3>
              <button onClick={() => setFilterOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <FilterPanel
              categories={categories ?? []}
              category={category}
              minPrice={minPrice}
              maxPrice={maxPrice}
              featured={featured}
              updateParam={(k, v) => { updateParam(k, v); setFilterOpen(false); }}
            />
          </div>
        </>
      )}
    </div>
  );
}

interface FilterProps {
  categories: { _id: string; name: string; icon?: string }[];
  category: string; minPrice: string; maxPrice: string; featured: boolean;
  updateParam: (k: string, v: string) => void;
}

function FilterPanel({ categories, category, minPrice, maxPrice, featured, updateParam }: FilterProps) {
  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">বিভাগ</h4>
        <div className="space-y-1">
          <button
            onClick={() => updateParam("category", "")}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors
              ${!category ? "bg-brand-50 text-brand-700 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
          >
            সব পণ্য
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => updateParam("category", cat._id)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center gap-2
                ${category === cat._id ? "bg-brand-50 text-brand-700 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
            >
              {cat.icon && <span>{cat.icon}</span>}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">দামের পরিসীমা</h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="সর্বনিম্ন"
            defaultValue={minPrice}
            onBlur={(e) => updateParam("minPrice", e.target.value)}
            className="input-field text-sm"
          />
          <input
            type="number"
            placeholder="সর্বোচ্চ"
            defaultValue={maxPrice}
            onBlur={(e) => updateParam("maxPrice", e.target.value)}
            className="input-field text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {[["0", "100"], ["100", "300"], ["300", "500"], ["500", ""]].map(([min, max]) => (
            <button
              key={min + max}
              onClick={() => { updateParam("minPrice", min); updateParam("maxPrice", max); }}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 hover:bg-gray-50 text-gray-600"
            >
              {max ? `৳${min}–৳${max}` : `৳${min}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Featured */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => updateParam("featured", featured ? "" : "true")}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer
              ${featured ? "bg-brand-600" : "bg-gray-200"}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all
              ${featured ? "left-5" : "left-0.5"}`} />
          </div>
          <span className="text-sm font-medium text-gray-700">শুধু অফার পণ্য</span>
        </label>
      </div>
    </div>
  );
}
