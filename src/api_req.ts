/**
 * Unified API client.
 * Merges the original api_req.ts with the new auth-aware apiFetch.
 * All calls automatically inject:
 *   - Authorization: Bearer <token>  (authenticated users)
 *   - X-Guest-Session: <uuid>        (guests)
 */

const BASE_URL = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:3000";

// ── Session helpers ───────────────────────────────────────────────────────────

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

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): PublicUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as PublicUser) : null;
}

export function storeAuth(resp: AuthResponse): void {
  localStorage.setItem(TOKEN_KEY, resp.token);
  localStorage.setItem(USER_KEY, JSON.stringify(resp.user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function clearGuestSession(): void {
  localStorage.removeItem(GUEST_SESSION_KEY);
}

// ── Core fetch ────────────────────────────────────────────────────────────────

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    headers["X-Guest-Session"] = getGuestSessionId();
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────
import type { TickerName, Stock, PredictionResult, AuthResponse, RegisterPayload, PublicUser, StockForPrediction } from "./types";


// ── Stock API (merged from api_req.ts) ────────────────────────────────────────

export function getHello(): Promise<string> {
  return apiFetch<{ message: string }>("/").then((d) => d.message);
}

export function getStockNames(): Promise<TickerName[]> {
  return apiFetch<TickerName[]>("/stocks/names").then((data) =>
    Array.isArray(data) ? data : []
  );
}

export function getStocksData(tickers: string[] = []): Promise<Stock[]> {
  return apiFetch<Stock[]>("/stocks", {
    method: "POST",
    body: JSON.stringify({ tickers }),
  }).then((data) => (Array.isArray(data) ? data : []));
}

export function addNewTicker(ticker: string, interval: string, range: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/stocks/add", {
    method: "POST",
    body: JSON.stringify({ ticker, interval, range }),
  }).catch((err) => {
    alert("Oops, ticker could not be added.");
    throw err;
  });
}

export function predict(predictionPrep: StockForPrediction, ): Promise<PredictionResult> {
  console.log("Sending prediction request with payload:", predictionPrep);
  return apiFetch<PredictionResult>("/predict", {
    method: "POST",
    body: JSON.stringify(predictionPrep),
  }).catch((err) => {
    alert("Oops, prediction failed.");
    throw err;
  });
}

// ── Auth API ──────────────────────────────────────────────────────────────────

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const resp = await apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ ...payload, guest_session_id: getGuestSessionId() }),
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
  await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  clearAuth();
  getGuestSessionId(); // mint fresh guest session
}

export function fetchMe(): Promise<PublicUser> {
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