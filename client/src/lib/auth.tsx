import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { User } from "@shared/schema";
import { apiRequest } from "./queryClient";

interface AuthState {
  user: (Omit<User, "password">) | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: any) => Promise<void>;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: false,
  });

  const login = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      const data = await res.json();
      setState({ user: data.user, token: data.token, isLoading: false });
    } catch (e) {
      setState(s => ({ ...s, isLoading: false }));
      throw e;
    }
  }, []);

  const register = useCallback(async (formData: any) => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      const res = await apiRequest("POST", "/api/auth/register", formData);
      const data = await res.json();
      setState({ user: data.user, token: data.token, isLoading: false });
    } catch (e) {
      setState(s => ({ ...s, isLoading: false }));
      throw e;
    }
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, token: null, isLoading: false });
  }, []);

  const updateProfile = useCallback(async (data: any) => {
    if (!state.token) return;
    const res = await fetch(`/api/auth/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error actualizando perfil");
    const updated = await res.json();
    setState(s => ({ ...s, user: updated }));
  }, [state.token]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile,
        isAdmin: state.user?.role === "admin",
        isAuthenticated: !!state.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
