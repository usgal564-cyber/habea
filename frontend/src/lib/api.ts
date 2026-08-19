const BASE_URL = import.meta.env.VITE_API_URL || "https://habea.onrender.com";

export async function apiFetch<T = any>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    let token = typeof window !== "undefined" ? localStorage.getItem("habea_token") : null;

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

    // URL форматыг зөв болгох (Double slash эсвэл дутуу slash гарахаас сэргийлнэ)
    const formattedPath = url.startsWith("/") ? url : `/${url}`;
    const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${formattedPath}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string>),
    };

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