"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { auth, signOut } from "@/lib/firebase/client";
import { User, LogOut, Mail, Phone } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AccountPage() {
  const router = useRouter();
  const { firebaseUser, profile, loading } = useAuthStore();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push("/login");
    }
  }, [firebaseUser, loading, router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut(auth);
      useAuthStore.setState({ firebaseUser: null, profile: null, token: null });
      toast.success("সফলভাবে লগআউট হয়েছে!");
      router.push("/");
    } catch (err) {
      toast.error("লগআউটে সমস্যা হয়েছে");
      console.error(err);
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (!firebaseUser || !profile) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">আমার অ্যাকাউন্ট</h1>
        <p className="text-gray-500 mt-2">আপনার প্রোফাইল তথ্য এবং অর্ডার ট্র্যাক করুন</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 h-32"></div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex flex-col items-center -mt-16 mb-6">
            <div className="w-32 h-32 bg-white rounded-full border-4 border-green-600 flex items-center justify-center shadow-lg">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-green-600" />
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
            <p className="text-green-600 font-medium mt-1 capitalize">{profile.role}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">ইমেইল</p>
                <p className="text-gray-800 font-medium break-all">{profile.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">ফোন নম্বর</p>
                <p className="text-gray-800 font-medium">{profile.phone || "সংযুক্ত নয়"}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 flex-col sm:flex-row">
            <Link
              href="/orders"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 text-center"
            >
              আমার অর্ডার দেখুন
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogOut className="w-5 h-5" />
              {loggingOut ? "লগআউট হচ্ছে..." : "লগআউট"}
            </button>
          </div>
        </div>
      </div>

      {/* Additional Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/cart"
          className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 transition duration-200"
        >
          <p className="font-medium text-blue-900">আমার কার্ট</p>
          <p className="text-sm text-blue-700 mt-1">যোগ করা পণ্য দেখুন</p>
        </Link>
        <Link
          href="/wishlist"
          className="bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-lg p-4 transition duration-200"
        >
          <p className="font-medium text-pink-900">উইশলিস্ট</p>
          <p className="text-sm text-pink-700 mt-1">পছন্দের পণ্য দেখুন</p>
        </Link>
      </div>
    </div>
  );
}
