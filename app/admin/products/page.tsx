"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAxios } from "@/store/authStore";
import { Plus, Pencil, Trash2, Search, X, Upload, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useCategories } from "@/hooks/useProducts";

interface Product {
  _id: string; name: string; slug: string; price: number; discountPrice?: number;
  unit: string; quantity: number; images: string[]; isActive: boolean; isFeatured: boolean;
  category: { _id: string; name: string };
}

const EMPTY_FORM = {
  name: "", description: "", price: "", discountPrice: "", unit: "কেজি",
  quantity: "", images: [] as string[], category: "", tags: "",
  isActive: true, isFeatured: false, sku: "", origin: "",
};

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const { data: categories } = useCategories();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imgUploading, setImgUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", page, search],
    queryFn: () => authAxios.get(`/products?page=${page}&limit=10&search=${search}`).then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      editing
        ? authAxios.patch(`/products/${editing._id}`, body).then((r) => r.data)
        : authAxios.post("/products", body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success(editing ? "পণ্য আপডেট হয়েছে" : "পণ্য যোগ হয়েছে");
      closeModal();
    },
    onError: (e: unknown) => {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "সমস্যা হয়েছে");
    },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      authAxios.patch(`/products/${id}`, { isActive }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, description: "", price: String(p.price),
      discountPrice: p.discountPrice ? String(p.discountPrice) : "",
      unit: p.unit, quantity: String(p.quantity), images: p.images,
      category: p.category?._id ?? "", tags: "", isActive: p.isActive,
      isFeatured: p.isFeatured, sku: "", origin: "",
    });
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await authAxios.post("/upload", fd);
      setForm((f) => ({ ...f, images: [...f.images, data.data.url] }));
      toast.success("ছবি আপলোড হয়েছে");
    } catch { toast.error("ছবি আপলোড ব্যর্থ"); }
    finally { setImgUploading(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      name: form.name,
      description: form.description,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      unit: form.unit,
      quantity: Number(form.quantity),
      images: form.images.length ? form.images : ["https://placehold.co/400x400/e2e8f0/94a3b8?text=পণ্য"],
      category: form.category,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      sku: form.sku || undefined,
      origin: form.origin || undefined,
    });
  };

  return (
    <div className="max-w-7xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">পণ্য ব্যবস্থাপনা</h1>
          <p className="text-sm text-gray-500">{data?.pagination?.total ?? 0}টি পণ্য</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> নতুন পণ্য যোগ
        </button>
      </div>

      {/* Search */}
      <div className="card p-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-9" placeholder="পণ্যের নাম খুঁজুন..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                <th className="px-5 py-3.5">পণ্য</th>
                <th className="px-4 py-3.5">বিভাগ</th>
                <th className="px-4 py-3.5">দাম</th>
                <th className="px-4 py-3.5">স্টক</th>
                <th className="px-4 py-3.5">স্ট্যাটাস</th>
                <th className="px-4 py-3.5">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-8 skeleton rounded" /></td></tr>
                  ))
                : data?.data?.map((p: Product) => (
                    <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={p.images[0] ?? "/placeholder.jpg"}
                              alt={p.name} fill className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 max-w-[180px] truncate">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="badge-green">{p.category?.name}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-brand-700">৳{p.discountPrice ?? p.price}</p>
                        {p.discountPrice && <p className="text-xs text-gray-400 line-through">৳{p.price}</p>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`font-semibold text-sm ${p.quantity <= 5 ? "text-red-500" : "text-gray-700"}`}>
                          {p.quantity}
                        </span>
                        {p.quantity <= 5 && p.quantity > 0 && <p className="text-xs text-orange-500">কম</p>}
                        {p.quantity === 0 && <p className="text-xs text-red-500">শেষ</p>}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => toggleActive.mutate({ id: p._id, isActive: !p.isActive })}
                          className={`flex items-center gap-1.5 text-xs font-medium transition-colors
                            ${p.isActive ? "text-green-600" : "text-gray-400"}`}
                        >
                          {p.isActive
                            ? <ToggleRight className="w-5 h-5" />
                            : <ToggleLeft className="w-5 h-5" />}
                          {p.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(p)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("এই পণ্য মুছে ফেলবেন?"))
                                authAxios.delete(`/products/${p._id}`)
                                  .then(() => { qc.invalidateQueries({ queryKey: ["admin-products"] }); toast.success("মুছে ফেলা হয়েছে"); })
                                  .catch(() => toast.error("সমস্যা হয়েছে"));
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination && (
          <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between text-sm">
            <p className="text-gray-500">
              মোট {data.pagination.total}টির মধ্যে পৃষ্ঠা {page} / {data.pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                ← আগের
              </button>
              <button disabled={!data.pagination.hasNext} onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                পরের →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={closeModal} />
          <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white z-50 overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-bold text-lg">{editing ? "পণ্য সম্পাদনা" : "নতুন পণ্য যোগ"}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Images */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ছবি</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                      <Image src={img} alt="" fill className="object-cover" />
                      <button type="button"
                        onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
                    {imgUploading ? <Loader2 className="w-5 h-5 animate-spin text-brand-500" /> : <>
                      <Upload className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-400">ছবি যোগ</span>
                    </>}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">পণ্যের নাম *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required className="input-field" placeholder="পণ্যের নাম লিখুন" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">বিবরণ *</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required rows={3} className="input-field resize-none" placeholder="পণ্যের বিস্তারিত বিবরণ" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">বিভাগ *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    required className="input-field">
                    <option value="">বিভাগ নির্বাচন করুন</option>
                    {categories?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">একক *</label>
                  <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    required className="input-field" placeholder="কেজি, লিটার, পিস" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">মূল দাম (৳) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required min={0} className="input-field" placeholder="৳" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ছাড়ের দাম (৳)</label>
                  <input type="number" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                    min={0} className="input-field" placeholder="ঐচ্ছিক" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">স্টক পরিমাণ *</label>
                  <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    required min={0} className="input-field" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU</label>
                  <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="input-field" placeholder="ঐচ্ছিক" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ট্যাগ (কমা দিয়ে আলাদা করুন)</label>
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="input-field" placeholder="তাজা, দেশী, জৈব" />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-brand-600" />
                    <span className="text-sm font-medium text-gray-700">সক্রিয়</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-brand-600" />
                    <span className="text-sm font-medium text-gray-700">ফিচার্ড</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-outline flex-1">বাতিল</button>
                <button type="submit" disabled={saveMutation.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saveMutation.isPending
                    ? <><Loader2 className="w-4 h-4 animate-spin" />সংরক্ষণ হচ্ছে...</>
                    : editing ? "আপডেট করুন" : "যোগ করুন"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
