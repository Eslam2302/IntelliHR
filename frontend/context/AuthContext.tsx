"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

type UserResponse = {
  id: number;
  email: string;
  employee_id: number;
  employee: Record<string, any>; // All employee data from API
};

interface AuthContextType {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Store ALL data from API - use what you need where you need it
        if (data && data.employee) {
          setUser(data);
        }
      } else {
        if (response.status === 401 || response.status === 403) {
          Cookies.remove("token");
          setUser(null);
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Refetch user data when navigating to dashboard (after login)
  useEffect(() => {
    if (pathname?.startsWith("/dashboard")) {
      const token = Cookies.get("token");
      if (token && !user && !isLoading) {
        fetchUserProfile();
      }
    }
  }, [pathname, user, isLoading, fetchUserProfile]);

  const logout = useCallback(() => {
    Cookies.remove("token");
    setUser(null);
    router.push("/login");
  }, [router]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        logout,
        refreshUser: fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
