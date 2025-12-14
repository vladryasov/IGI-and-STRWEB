import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { API_URL } from "../config";

export const AuthContext = createContext(null);

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => safeJsonParse(localStorage.getItem("user") || "null"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken || "");
    setUser(nextUser || null);
    if (nextToken) localStorage.setItem("token", nextToken);
    else localStorage.removeItem("token");
    if (nextUser) localStorage.setItem("user", JSON.stringify(nextUser));
    else localStorage.removeItem("user");
  }, []);

  const logout = useCallback(() => setSession("", null), [setSession]);

  const authHeaders = useMemo(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const login = useCallback(
    async ({ email, password }) => {
      setLoading(true);
      setError("");
      try {
        const r = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.message || "Login failed");
        setSession(data.token, data.user);
      } catch (e) {
        setError(e.message || "Login failed");
      } finally {
        setLoading(false);
      }
    },
    [setSession]
  );

  const register = useCallback(
    async ({ name, email, password }) => {
      setLoading(true);
      setError("");
      try {
        const r = await fetch(`${API_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.message || "Register failed");
        setSession(data.token, data.user);
      } catch (e) {
        setError(e.message || "Register failed");
      } finally {
        setLoading(false);
      }
    },
    [setSession]
  );

  const fetchMe = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`${API_URL}/api/auth/me`, { headers: { ...authHeaders } });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Failed to fetch profile");
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (e) {
      setError(e.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }, [authHeaders, token]);

  // handle Google OAuth redirect: /profile?token=...
  useEffect(() => {
    const url = new URL(window.location.href);
    const t = url.searchParams.get("token");
    if (t) {
      setSession(t, user);
      url.searchParams.delete("token");
      window.history.replaceState({}, "", url.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      error,
      authHeaders,
      login,
      register,
      logout,
      fetchMe
    }),
    [token, user, loading, error, authHeaders, login, register, logout, fetchMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}



