const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export function getToken() { return localStorage.getItem("skillnex_token") || sessionStorage.getItem("skillnex_token"); }
export async function api(path: string, options: RequestInit = {}) {
  const token = getToken();
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}
