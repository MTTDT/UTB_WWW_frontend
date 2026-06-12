import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  type AuthResponse,
  type PublicUser,
  type RegisterPayload,
  clearAuth,
  fetchMe,
  getStoredUser,
  getToken,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from "../api_req";

interface AuthContextValue {
  user: PublicUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthProvider(): AuthContextValue {
  const [user, setUser] = useState<PublicUser | null>(getStoredUser);
  const [isLoading, setIsLoading] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) { 
        function a(){
            setIsLoading(false); 
        }
        a();
        return; 
    }
    fetchMe()
      .then(setUser)
      .catch(() => { clearAuth(); setUser(null); })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const resp: AuthResponse = await apiLogin(username, password);
    setUser(resp.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const resp: AuthResponse = await apiRegister(payload);
    setUser(resp.user);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  return { user, isAuthenticated: user !== null, isLoading, login, register, logout };
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}