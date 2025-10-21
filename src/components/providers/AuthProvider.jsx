"use client";
import { createContext, useContext, useState, useEffect } from "react";
import * as authService from "@/services/auth-service";
import { config } from "@/helpers/config";
import { hydrateFavoritesForToken, clearFavoriteCaches } from "@/lib/hooks/favorites-hydrate";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load user from localStorage when component mounts
  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Normal login using AuthService
  const login = async (credentials) => {
    const data = await authService.login(credentials);
    const authUser = { user: data.user, token: data.token };
    localStorage.setItem("authUser", JSON.stringify(authUser.user));
    localStorage.setItem("authToken", authUser.token);
    setUser(authUser);
    // Dispatch event for same-tab updates
    document.dispatchEvent(new Event("auth-change"));
    await hydrateFavoritesForToken(authUser.token);
    return authUser;
  };

  // Google login handler
  const loginWithGoogle = async (idToken) => {
    const response = await fetch(`${config.apiURL}/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Google login failed");

    const token = data?.returnBody?.token;
    const user = data?.returnBody;

    if (!token) throw new Error("Missing token from Google backend");

    const authUser = { ...user, token };
    localStorage.setItem("authUser", JSON.stringify(authUser?.user));
    localStorage.setItem("authToken", token);
    setUser(authUser);
// Dispatch event for same-tab updates
    document.dispatchEvent(new Event("auth-change"));
    return authUser;
  };

  const logout = () => {
    authService.logout(); // Clears localStorage
    setUser(null);
    // Dispatch event for same-tab updates
    document.dispatchEvent(new Event("auth-change"));
    clearFavoriteCaches();
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
