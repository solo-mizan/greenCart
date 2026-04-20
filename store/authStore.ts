"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { auth, onAuthStateChanged, signOut, type User } from "@/lib/firebase/client";
import axios from "axios";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  avatar?: string;
}

interface AuthState {
  firebaseUser: User | null;
  profile: UserProfile | null;
  token: string | null;
  loading: boolean;
  setFirebaseUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (v: boolean) => void;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      firebaseUser: null,
      profile: null,
      token: null,
      loading: true,

      setFirebaseUser: (user) => set({ firebaseUser: user }),
      setProfile: (profile) => set({ profile }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ loading }),

      getToken: async () => {
        const { firebaseUser } = get();
        if (!firebaseUser) return null;
        const token = await firebaseUser.getIdToken();
        set({ token });
        return token;
      },

      logout: async () => {
        await signOut(auth);
        set({ firebaseUser: null, profile: null, token: null });
      },
    }),
    {
      name: "greencart-auth",
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);

// Axios instance with auto-auth headers
export const authAxios = axios.create({ baseURL: "/api" });

authAxios.interceptors.request.use(async (config) => {
  const store = useAuthStore.getState();
  const token = await store.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
