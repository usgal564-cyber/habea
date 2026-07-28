import { create } from "zustand";
import type { JWTPayload } from "@/lib/auth";

interface AuthState {
  user: JWTPayload | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: JWTPayload | null, token: string | null) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("habea_token") ? (() => {
    try {
      const token = localStorage.getItem("habea_token");
      if (!token) return null;
      // decode base64url to get payload
      const parts = token.split(".");
      if (parts.length < 2) return null;
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
      return { userId: payload.userId, email: payload.email, role: payload.role };
    } catch {
      return null;
    }
  })() : null : null,
  token: typeof window !== "undefined" ? localStorage.getItem("habea_token") : null,
  isLoading: false,
  setAuth: (user, token) => {
    if (token && typeof window !== "undefined") {
      localStorage.setItem("habea_token", token);
    } else if (typeof window !== "undefined") {
      localStorage.removeItem("habea_token");
    }
    set({ user, token });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("habea_token");
    }
    set({ user: null, token: null });
  },
  setLoading: (loading) => set({ isLoading: loading }),
}));
