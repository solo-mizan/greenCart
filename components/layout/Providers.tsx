"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { auth, onAuthStateChanged } from "@/lib/firebase/client";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

function AuthInitializer() {
  const { setFirebaseUser, setProfile, setLoading, getToken } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          const { data } = await axios.get("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setProfile(data.data);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [setFirebaseUser, setProfile, setLoading, getToken]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      {children}
    </QueryClientProvider>
  );
}
