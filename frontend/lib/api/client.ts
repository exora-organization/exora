import { auth } from "../firebase/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1";

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const err = new Error((data && data.error && data.error.message) || "An error occurred");
    // @ts-ignore attach status and body for caller to inspect
    err.status = response.status;
    // @ts-ignore
    err.body = data;
    throw err;
  }

  return data as T;
}
