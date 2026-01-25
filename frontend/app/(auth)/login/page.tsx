"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { login as loginApi } from "@/services/api/auth";
import type { LoginCredentials } from "@/lib/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function LoginPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Call the API to login
      const credentials: LoginCredentials = {
        employee_id: employeeId,
        password: password,
      };

      const response = await loginApi(credentials);

      // If successful, save token, permissions and redirect
      // Backend returns permissions in response.user.permissions (not response.permissions)
      const permissions = response.user?.permissions || [];


      await login(
        response.token,
        permissions,
        redirectTo || "/dashboard",
      );
    } catch (err) {
      // Handle errors
      const errorMessage =
        err instanceof Error ? err.message : "Invalid login credentials";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tl from-white via-indigo-50 to-indigo-50 font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-100 opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-50 opacity-40 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md px-6">
        <div className="rounded-2xl bg-white p-10 shadow-2xl">
          {/* Logo/Title Section */}
          <div className="mb-10 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 shadow-lg">
                <svg
                  className="h-10 w-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="mb-2 text-4xl font-bold text-indigo-700">
              IntelliHR
            </h1>
            <p className="text-sm font-medium text-gray-600">
              Employee Management System
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee ID Field */}
            <div className="space-y-2">
              <label
                htmlFor="employeeId"
                className="block text-sm font-semibold text-gray-700"
              >
                Employee ID
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    />
                  </svg>
                </div>
                <input
                  id="employeeId"
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter your employee ID"
                  className="w-full rounded-lg border-2 border-gray-200 bg-white pl-12 pr-4 py-3.5 text-base text-gray-900 placeholder-gray-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border-2 border-gray-200 bg-white pl-12 pr-4 py-3.5 text-base text-gray-900 placeholder-gray-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="flex justify-end">
                <a
                  href="#"
                  className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full overflow-hidden rounded-lg px-5 py-3.5 text-base font-semibold text-white shadow-lg transition-all 
                ${isLoading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                }`}
            >
              <span className="relative flex items-center justify-center gap-2">
                {isLoading && <LoadingSpinner size="sm" inline />}
                {isLoading ? "Signing in..." : "Sign In"}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-xs text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              © 2025 IntelliHR. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
