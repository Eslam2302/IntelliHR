"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const handleAvatarClick = () => {
    router.push("/dashboard/profile");
  };

  const handleBrandClick = () => {
    router.push("/dashboard");
  };

  const getInitial = (firstName: string) => {
    return firstName.charAt(0).toUpperCase();
  };

  const getFullName = (firstName: string, lastName: string) => {
    return `${firstName} ${lastName}`.trim();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 p-2 bg-indigo-600 text-white rounded-lg lg:hidden"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out lg:static lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        ${isCollapsed ? "lg:w-20" : "lg:w-64"}
        w-64 bg-gradient-to-b from-indigo-700 to-indigo-900 flex flex-col
      `}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute -right-3 top-12 z-50 h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md border-2 border-white transition-all duration-300 group
            hidden lg:flex 
          `}
        >
          <svg
            className={`h-4 w-4 transition-transform duration-500 ${
              isCollapsed ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)] bg-[length:20px_20px]"></div>
        </div>
        {/* Logo Section */}
        <div className="relative h-20 flex items-center px-4 border-b border-indigo-600/30 backdrop-blur-sm overflow-hidden">
          <button
            onClick={handleBrandClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            title="Go to Dashboard"
          >
            <div className="flex h-10 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm shadow-lg">
              <svg
                className="h-6 w-6 text-white"
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
            {!isCollapsed && (
              <span className="text-xl font-bold text-white tracking-tight whitespace-nowrap opacity-100 transition-opacity duration-300">
                IntelliHR
              </span>
            )}{" "}
          </button>
        </div>
        {/* Navigation Section */}
        <nav className="relative flex-1 p-4 overflow-y-auto">
          <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider px-3 mb-4">
            Menu
          </p>
          <div className="space-y-1"></div>
        </nav>
        {/* User Profile Section */}
        <div className="relative p-3 border-t border-indigo-600/30 backdrop-blur-sm bg-indigo-900/50">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <button
              onClick={handleAvatarClick}
              className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
              title="View Profile"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-white font-semibold text-sm">
                  {user?.employee?.first_name
                    ? getInitial(user.employee.first_name)
                    : "U"}
                </span>
              )}
            </button>
            {!isCollapsed && (
              <button
                onClick={handleAvatarClick}
                className="flex-1 min-w-0 transition-opacity duration-300 text-left hover:opacity-80 cursor-pointer"
              >
                {isLoading ? (
                  <div className="space-y-1">
                    <div className="h-4 w-20 bg-white/20 rounded animate-pulse"></div>
                    <div className="h-3 w-16 bg-white/10 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-white truncate">
                      {user?.employee
                        ? getFullName(
                            user.employee.first_name,
                            user.employee.last_name
                          )
                        : "User"}
                    </p>
                    {user?.employee?.personal_email && (
                      <p className="text-xs text-indigo-200 truncate">
                        {user.employee.personal_email}
                      </p>
                    )}
                  </>
                )}
              </button>
            )}
            {/* Logout Button */}
            {!isCollapsed && (
              <button
                onClick={logout}
                className="p-2 rounded-md text-indigo-300 hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0"
                title="Logout"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-white"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </aside>
    </>
  );
}
