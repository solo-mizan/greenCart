"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAxios } from "@/store/authStore";
import { Plus, Pencil, Trash2, X, Loader2, GripVertical } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  _id: string; name: string; slug: string; icon?: string;
  description?: string; isActive: boolean; sortOrder: number;
}

const EMPTY_FORM = { name: "", slug: "", icon: "", description: "", isActive: true, sortOrder: 0 };

const POPULAR_ICONS = ["🥦","🍎","🥛","🐟","🍖","🌾","🛒","🧴","🧂","🥚","🧅","🌽","🍋","🫒","🧇"];

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: () => authAxios.get("/categories").then((r) => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: (body: typeof EMPTY_FORM) =>
      editing
        ? authAxios.patch(`/categories/${editing._id}`, body).then((r) => r.data)
        : authAxios.post("/categories", body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success(editing ? "বিভাগ আপডেট হয়েছে" : "বিভাগ যোগ হয়েছে");
      closeModal();
    },
    onError: () => toast.error("সমস্যা হয়েছে"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => authAxios.delete(`/categories/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("বিভাগ মুছে ফেলা হয়েছে");
    },
  });

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon ?? "", description: cat.description ?? "", isActive: cat.isActive, sortOrder: cat.sortOrder });
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const autoSlug = (name: string) =>
    name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">বিভাগ ব্যবস্থাপনা</h1>
          <p className="text-sm text-gray-500">{categories?.length ?? 0}টি বিভাগ</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> নতুন বিভাগ
        </button>
      </div>

      {/* Categories grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="card p-5 h-28 skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map((cat) => (
            <div key={cat._id} className={`card p-4 flex items-start gap-3 group hover:shadow-md transition-shadow
              ${!cat.isActive ? "opacity-60" : ""}`}>
              <GripVertical className="w-4 h-4 text-gray-300 mt-1 flex-shrink-0" />
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {cat.icon ?? "📦"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{cat.name}</p>
                <p className="text-xs text-gray-400 font-mono">{cat.slug}</p>
                {cat.description && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{cat.description}</p>}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cat.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {cat.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                  </span>
                  <span className="text-xs text-gray-400">ক্রম: {cat.sortOrder}</span>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button onClick={() => openEdit(cat)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { if (confirm("এই বিভাগ মুছবেন?")) deleteMutation.mutate(cat._id); }}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={closeModal} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white z-50 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-lg">{editing ? "বিভাগ সম্পাদনা" : "নতুন বিভাগ"}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Icon picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">আইকন নির্বাচন করুন</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {POPULAR_ICONS.map((icon) => (
                    <button type="button" key={icon}
                      onClick={() => setForm({ ...form, icon })}
                      className={`w-10 h-10 text-xl rounded-xl hover:bg-gray-100 transition-colors
                        ${form.icon === icon ? "bg-brand-100 ring-2 ring-brand-500" : ""}`}>
                      {icon}
                    </button>
                  ))}
                </div>
                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="input-field text-sm" placeholder="বা ইমোজি লিখুন (যেমন: 🥬)" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">বিভাগের নাম *</label>
                <input value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : autoSlug(e.target.value) })}
                  required className="input-field" placeholder="যেমন: তাজা সবজি" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">স্লাগ (URL) *</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required pattern="[a-z0-9-]+" className="input-field font-mono text-sm" placeholder="taaza-sobji" />
                <p className="text-xs text-gray-400 mt-1">শুধু ইংরেজি ছোট হাতের অক্ষর, সংখ্যা ও হাইফেন</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">বিবরণ</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2} className="input-field resize-none" placeholder="বিভাগের সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">সাজানোর ক্রম</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                    className="input-field" min={0} />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-brand-600" />
                    <span className="text-sm font-medium text-gray-700">সক্রিয়</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-outline flex-1">বাতিল</button>
                <button type="submit" disabled={saveMutation.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saveMutation.isPending
                    ? <><Loader2 className="w-4 h-4 animate-spin" />সংরক্ষণ...</>
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
