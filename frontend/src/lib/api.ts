const BASE_URL = "https://habea.onrender.com";

export async function apiFetch(url: string, options?: RequestInit) {
  try {
    // LocalStorage эсвэл Zustand-аас токеноо шалгана
    let token = typeof window !== "undefined" ? localStorage.getItem("habea_token") : null;

    // Хэрэв habea_token байхгүй бол Zustand-ийн хадгалсан хувилбараас олох гэж задарна
    if (!token && typeof window !== "undefined") {
      const authStore = localStorage.getItem("habea_auth_store");
      if (authStore) {
        try {
          const parsed = JSON.parse(authStore);
          token = parsed?.state?.token || null;
        } catch {
          token = null;
        }
      }
    }

    const fullUrl = url.startsWith("http")
      ? url
      : `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string>),
    };

    // Хэрэв токен олдвол Authorization Header-т автоматаар хийнэ
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (!res.ok) {
      console.warn(`API Warning: ${res.status} ${res.statusText} -> ${fullUrl}`);
    }

    return await res.json();
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
}