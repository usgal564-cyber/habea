import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    
    // JWT доторх key-нүүд өөр байж магадгүй тул fallback хийж өгөв
    return {
      userId: payload.userId || payload.user_id || payload.sub,
      email: payload.email,
      role: payload.role || "user",
      name: payload.name,
      firstName: payload.firstName || payload.first_name,
      lastName: payload.lastName || payload.last_name,
      phone: payload.phone,
    };
  } catch {
    return null;
  }
}

interface AuthState {
  user: JWTPayload | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: JWTPayload | null, token: string | null) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      setAuth: (user, token) => {
        // Хэрэв user ирээгүй ч token ирсэн бол token-оосоо decode хийж авна
        const decodedUser = user || (token ? decodeJWT(token) : null);
        set({ user: decodedUser, token });
      },

      logout: () => {
        set({ user: null, token: null });
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "habea_auth_store", // Storage-ийн нэр
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }), // Зөвхөн user, token хоёрыг л хадгална
    }
  )
);