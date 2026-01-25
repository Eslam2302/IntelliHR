/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
import Cookies from "js-cookie";
import { API_URL } from "@/config/api";
import type { User, LoginResponse, LoginCredentials } from "@/lib/types";

/**
 * Login function
 * Sends credentials to backend and returns token
 */
export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle errors from backend
    throw new Error(data.message || "Login failed");
  }

  return data;
}

/**
 * Logout function
 * Removes the token and permissions cookies
 */
export function logout(): void {
  Cookies.remove("token");
  Cookies.remove("permissions");
}

/**
 * Get current token from cookie
 */
export function getToken(): string | undefined {
  return Cookies.get("token");
}

/**
 * Save token to cookie
 */
export function setToken(token: string): void {
  Cookies.set("token", token, { 
    expires: 1,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

/**
 * Save permissions to cookie
 */
export function setPermissions(permissions: string[]): void {
  // Set cookie with proper settings for middleware access
  // Important: These settings ensure middleware can read the cookie
  Cookies.set("permissions", JSON.stringify(permissions), { 
    expires: 1,
    path: "/", // Available for all paths
    sameSite: "lax", // Allow cookie in middleware requests
    secure: process.env.NODE_ENV === "production", // Secure in production
  });
}

/**
 * Get permissions from cookie
 */
export function getPermissions(): string[] {
  const permissions = Cookies.get("permissions");
  if (!permissions) return [];
  try {
    return JSON.parse(permissions);
  } catch {
    return [];
  }
}

/**
 * Get current logged-in user data
 * Fetches user profile from backend using the stored token
 */
export async function getCurrentUser(): Promise<User> {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_URL}/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    // If token is invalid, throw error to trigger logout
    throw new Error(data.message || "Failed to fetch user data");
  }

  return data;
}
