"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { auth, createUserWithEmailAndPassword, updateProfile, signInWithPopup, googleProvider } from "@/lib/firebase/client";
import axios from "axios";
import toast from "react-hot-toast";

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8,        label: "কমপক্ষে ৮ অক্ষর" },
  { test: (p: string) => /[A-Z]/.test(p),      label: "একটি বড় হাতের অক্ষর" },
  { test: (p: string) => /[0-9]/.test(p),      label: "একটি সংখ্যা" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(cred.user, { displayName: form.name });
      const token = await cred.user.getIdToken();
      await axios.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        firebaseUid: cred.user.uid,
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!");
      router.push("/");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      const messages: Record<string, string> = {
        "auth/email-already-in-use": "এই ইমেইলে ইতিমধ্যে অ্যাকাউন্ট আছে",
        "auth/weak-password": "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে",
      };
      toast.error(messages[code ?? ""] ?? "নিবন্ধন ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      await axios.post("/api/auth/register", {
        name: result.user.displayName ?? "ব্যবহারকারী",
        email: result.user.email,
        firebaseUid: result.user.uid,
      }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
      toast.success("Google দিয়ে নিবন্ধন সফল!");
      router.push("/");
    } catch { toast.error("Google নিবন্ধন ব্যর্থ"); }
  };

  return (
    <div className="w-full max-w-md">
      <div className="card p-8">
        <div className="text-center mb-7">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">গ্র</div>
          <h1 className="text-2xl font-bold text-gray-800">নতুন অ্যাকাউন্ট</h1>
          <p className="text-gray-500 text-sm mt-1">গ্রিনকার্টে যোগ দিন</p>
        </div>

        <button onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 border-2 border-gray-200
                     hover:border-gray-300 hover:bg-gray-50 rounded-xl px-4 py-3 text-sm font-semibold
                     text-gray-700 transition-all mb-5">
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google দিয়ে নিবন্ধন
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">অথবা ইমেইল দিয়ে</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">পূর্ণ নাম *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              required className="input-field" placeholder="আপনার পূর্ণ নাম" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ইমেইল *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              required className="input-field" placeholder="আপনার ইমেইল" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">মোবাইল নম্বর</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field" placeholder="01XXXXXXXXX (ঐচ্ছিক)" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">পাসওয়ার্ড *</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required minLength={8} className="input-field pr-10" placeholder="শক্তিশালী পাসওয়ার্ড দিন" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.password && (
              <div className="mt-2 space-y-1">
                {PASSWORD_RULES.map((r) => (
                  <div key={r.label} className={`flex items-center gap-1.5 text-xs ${r.test(form.password) ? "text-green-600" : "text-gray-400"}`}>
                    <CheckCircle className={`w-3 h-3 ${r.test(form.password) ? "fill-green-600 text-green-600" : ""}`} />
                    {r.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />তৈরি হচ্ছে...</> : "অ্যাকাউন্ট তৈরি করুন"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
          <Link href="/login" className="text-brand-600 font-semibold hover:underline">লগইন করুন</Link>
        </p>
      </div>
    </div>
  );
}
