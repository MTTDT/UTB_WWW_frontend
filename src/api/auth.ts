const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface PublicUser {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export interface ApiError {
  error: string;
}

// ── Guest session ID ──────────────────────────────────────────────────────────

const GUEST_SESSION_KEY = "guest_session_id";
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function getGuestSessionId(): string {
  let id = localStorage.getItem(GUEST_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(GUEST_SESSION_KEY, id);
  }
  return id;
}

export function clearGuestSession(): void {
  localStorage.removeItem(GUEST_SESSION_KEY);
}


export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): PublicUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as PublicUser) : null;
}

function storeAuth(resp: AuthResponse): void {
  localStorage.setItem(TOKEN_KEY, resp.token);
  localStorage.setItem(USER_KEY, JSON.stringify(resp.user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}


export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const guestId = getGuestSessionId();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    headers["X-Guest-Session"] = guestId;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({ error: res.statusText }))) as ApiError;
    throw new Error(body.error ?? "Request failed");
  }

  return res.json() as Promise<T>;
}


export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  guest_tickers?: Array<{ ticker: string; interval: string; range: string }>;
  guest_session_id?: string;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const enriched: RegisterPayload = {
    ...payload,
    guest_session_id: getGuestSessionId(),
  };

  const resp = await apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(enriched),
  });

  storeAuth(resp);
  clearGuestSession();
  return resp;
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const resp = await apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  storeAuth(resp);
  clearGuestSession();
  return resp;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } finally {
    clearAuth();
    getGuestSessionId();
  }
}

export async function fetchMe(): Promise<PublicUser> {
  return apiFetch<PublicUser>("/api/auth/me");
}

export function getUsers(): Promise<PublicUser[]> {
  return apiFetch<PublicUser[]>("/api/admin/users");
}

export function deleteUser(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/admin/users/${id}`, {
    method: "DELETE",
  });
}

export function changeRole(id: string, is_admin: boolean): Promise<PublicUser> {
  return apiFetch<PublicUser>(`/api/admin/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ is_admin }),
  });
}