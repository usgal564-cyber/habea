const BASE_URL = "https://habea.onrender.com";

export async function apiFetch(url: string, options?: RequestInit) {
  try {
    const fullUrl = url.startsWith("http")
      ? url
      : `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;

    const res = await fetch(fullUrl, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    return await res.json();
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
}