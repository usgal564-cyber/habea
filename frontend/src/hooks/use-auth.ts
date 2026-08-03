import { create } from "zustand";

interface JWTPayload {
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
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      firstName: payload.firstName,
      lastName: payload.lastName,
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

const storedToken = typeof window !== "undefined" ? localStorage.getItem("habea_token") : null;

export const useAuthStore = create<AuthState>((set) => ({
  user: storedToken ? decodeJWT(storedToken) : null,
  token: storedToken,
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
