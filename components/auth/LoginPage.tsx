"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  auth, signInWithEmailAndPassword, signInWithPopup,
  googleProvider, updateProfile
} from "@/lib/firebase/client";
import axios from "axios";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("সফলভাবে লগইন হয়েছে!");
      router.push("/");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      const messages: Record<string, string> = {
        "auth/user-not-found": "এই ইমেইলে কোনো অ্যাকাউন্ট নেই",
        "auth/wrong-password": "পাসওয়ার্ড সঠিক নয়",
        "auth/invalid-credential": "ইমেইল বা পাসওয়ার্ড সঠিক নয়",
        "auth/too-many-requests": "অনেক বার চেষ্টা হয়েছে। একটু পরে চেষ্টা করুন",
      };
      toast.error(messages[code ?? ""] ?? "লগইন ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      // Try to register in DB (idempotent)
      await axios.post("/api/auth/register", {
        name: result.user.displayName ?? "ব্যবহারকারী",
        email: result.user.email,
        firebaseUid: result.user.uid,
      }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
      toast.success("Google দিয়ে লগইন সফল!");
      router.push("/");
    } catch {
      toast.error("Google লগইন ব্যর্থ হয়েছে");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="card p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">গ্র</div>
          <h1 className="text-2xl font-bold text-gray-800">স্বাগতম!</h1>
          <p className="text-gray-500 text-sm mt-1">আপনার অ্যাকাউন্টে লগইন করুন</p>
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 border-2 border-gray-200
                     hover:border-gray-300 hover:bg-gray-50 rounded-xl px-4 py-3 text-sm font-semibold
                     text-gray-700 transition-all mb-5 disabled:opacity-60"
        >
          {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Google দিয়ে লগইন
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">অথবা ইমেইল দিয়ে</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ইমেইল</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="input-field" placeholder="আপনার ইমেইল"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium text-gray-700">পাসওয়ার্ড</label>
              <a href="#" className="text-xs text-brand-600 hover:underline">পাসওয়ার্ড ভুলে গেছি</a>
            </div>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                className="input-field pr-10" placeholder="পাসওয়ার্ড দিন"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />লগইন হচ্ছে...</> : "লগইন করুন"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          অ্যাকাউন্ট নেই?{" "}
          <Link href="/register" className="text-brand-600 font-semibold hover:underline">নিবন্ধন করুন</Link>
        </p>
      </div>
    </div>
  );
}
