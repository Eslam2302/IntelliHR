"use client";

/**
 * Auth Context
 * Manages authentication state across the entire app
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  getToken,
  setToken,
  getPermissions,
  setPermissions,
  logout as removeToken,
  getCurrentUser,
} from "@/services/api/auth";
import type { User } from "@/lib/types";

// Define the shape of our auth context
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];
  user: User | null;
  login: (token: string, permissions?: string[], redirectTo?: string) => void;
  logout: () => void;
}

// Create the context with undefined as default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 * Wraps the app and provides authentication state
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissionsState] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Check if user is logged in when app loads and fetch user data
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();
      const savedPermissions = getPermissions();

      if (token) {
        setIsAuthenticated(true);
        // Set permissions from cookies initially (for fast initial render)
        setPermissionsState(savedPermissions);

        // Fetch user data from backend
        try {
          const userData = await getCurrentUser();
          setUser(userData);

          // Backend /user endpoint returns permissions at userData.permissions
          // Use these permissions (they're more up-to-date than cookies)
          if (userData.permissions && Array.isArray(userData.permissions) && userData.permissions.length > 0) {
            setPermissionsState(userData.permissions);
            setPermissions(userData.permissions); // Update cookies with latest permissions
          } else if (savedPermissions.length > 0) {
            // Fallback to cookie permissions if user endpoint doesn't return them
            setPermissionsState(savedPermissions);
          }
        } catch (error) {
          // If fetching user fails (invalid token), clear auth state
          console.error("Failed to fetch user data:", error);
          removeToken();
          setIsAuthenticated(false);
          setPermissionsState([]);
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function - saves token and permissions to cookie and updates state
  const login = async (
    token: string,
    permissions?: string[],
    redirectTo: string = "/dashboard",
  ) => {
    setToken(token);
    if (permissions) {
      setPermissions(permissions);
      setPermissionsState(permissions);
    }
    setIsAuthenticated(true);

    // Fetch user data after login
    try {
      const userData = await getCurrentUser();


      setUser(userData);

      // Backend /user endpoint returns permissions at userData.permissions
      // Use these permissions if available (they're more up-to-date)
      if (userData.permissions && Array.isArray(userData.permissions) && userData.permissions.length > 0) {
        setPermissionsState(userData.permissions);
        setPermissions(userData.permissions); // Update cookies
      } else if (permissions && permissions.length > 0) {
        // Keep using permissions from login response
        setPermissionsState(permissions);
      }
    } catch (error) {
      console.error("Failed to fetch user data after login:", error);
      // Continue anyway - user is authenticated, data might load later
    }

    router.push(redirectTo);
  };

  // Logout function - removes token, permissions and redirects to login
  const logout = () => {
    removeToken();
    setIsAuthenticated(false);
    setPermissionsState([]);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        permissions,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 * Easy way to access auth context in any component
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
