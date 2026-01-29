"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PERMISSIONS } from "@/lib/constants/permissions";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user, isLoading: authLoading } = useAuth();

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
        className="fixed top-4 left-4 z-40 p-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-colors lg:hidden"
        aria-label="Open menu"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
          className={`absolute -right-3 top-12 z-50 h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md border-2 border-white transition-all duration-300 group hover:bg-indigo-700 hover:scale-110 hidden lg:flex`}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            className={`h-4 w-4 transition-transform duration-500 ${isCollapsed ? "rotate-180" : ""
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
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
          <Link
            href="/dashboard"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer group"
            title="Go to Dashboard"
          >
            <div className="flex h-10 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm shadow-lg group-hover:bg-white/20 transition-colors">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="IntelliHR Logo"
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
            )}
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="relative flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-600/30 scrollbar-track-transparent">
          {!isCollapsed && (
            <p className="text-xs font-semibold text-indigo-200/80 uppercase tracking-wider px-3 mb-4">
              Menu
            </p>
          )}

          {/* Departments */}
          <PermissionGuard permission={PERMISSIONS.DEPARTMENTS.VIEW_ALL}>
            <Link
              href="/dashboard/departments"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-100 hover:bg-indigo-800/50 hover:text-white transition-all duration-200 group active:scale-[0.98]"
              title="View Departments"
            >
              <svg
                className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-label="Departments icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              {!isCollapsed && (
                <span className="truncate">Departments</span>
              )}
            </Link>
          </PermissionGuard>

          {/* Employees */}
          <PermissionGuard permission={PERMISSIONS.EMPLOYEES.VIEW_ALL}>
            <Link
              href="/dashboard/employees"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-100 hover:bg-indigo-800/50 hover:text-white transition-all duration-200 group active:scale-[0.98]"
              title="View Employees"
            >
              <svg
                className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-label="Employees icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                />
              </svg>
              {!isCollapsed && (
                <span className="truncate">Employees</span>
              )}
            </Link>
          </PermissionGuard>

          {/* Attendance – check-in/check-out, last 5. No permission. */}
          <Link
            href="/dashboard/attendance"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-100 hover:bg-indigo-800/50 hover:text-white transition-all duration-200 group active:scale-[0.98]"
            title="Check in / Check out"
          >
            <svg className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Attendance icon">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {!isCollapsed && <span className="truncate">Attendance</span>}
          </Link>

          {/* Attendances – full list (HR). */}
          <PermissionGuard permission={PERMISSIONS.ATTENDANCES.VIEW_ALL}>
            <Link
              href="/dashboard/attendances"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-100 hover:bg-indigo-800/50 hover:text-white transition-all duration-200 group active:scale-[0.98]"
              title="Attendances"
            >
              <svg className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Attendances icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {!isCollapsed && <span className="truncate">Attendances</span>}
            </Link>
          </PermissionGuard>

          {/* Job positions */}
          <PermissionGuard permission={PERMISSIONS.JOB_POSITIONS.VIEW_ALL}>
            <Link
              href="/dashboard/job-positions"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-100 hover:bg-indigo-800/50 hover:text-white transition-all duration-200 group active:scale-[0.98]"
              title="Job positions"
            >
              <svg className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Job positions icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {!isCollapsed && <span className="truncate">Job positions</span>}
            </Link>
          </PermissionGuard>

          {/* Leave types */}
          <PermissionGuard permission={PERMISSIONS.LEAVE_TYPES.VIEW_ALL}>
            <Link
              href="/dashboard/leave-types"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-100 hover:bg-indigo-800/50 hover:text-white transition-all duration-200 group active:scale-[0.98]"
              title="Leave types"
            >
              <svg className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Leave types icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {!isCollapsed && <span className="truncate">Leave types</span>}
            </Link>
          </PermissionGuard>

          {/* Leave requests – my list + create button. All users. */}
          <Link
            href="/dashboard/leave-requests"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-100 hover:bg-indigo-800/50 hover:text-white transition-all duration-200 group active:scale-[0.98]"
            title="My leave requests"
          >
            <svg className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Leave requests icon">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {!isCollapsed && <span className="truncate">Leave requests</span>}
          </Link>

          {/* Team leave requests (manager dashboard) */}
          <PermissionGuard permission={PERMISSIONS.LEAVE_REQUESTS.VIEW_EMPLOYEES}>
            <Link
              href="/dashboard/leave-requests/manager"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-100 hover:bg-indigo-800/50 hover:text-white transition-all duration-200 group active:scale-[0.98]"
              title="Team leave requests"
            >
              <svg className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Team leave requests icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {!isCollapsed && <span className="truncate">Team leave requests</span>}
            </Link>
          </PermissionGuard>

          {/* Team attendance (manager) */}
          <PermissionGuard permission={PERMISSIONS.LEAVE_REQUESTS.VIEW_EMPLOYEES}>
            <Link
              href="/dashboard/attendances/team"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-100 hover:bg-indigo-800/50 hover:text-white transition-all duration-200 group active:scale-[0.98]"
              title="Team attendance"
            >
              <svg className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Team attendance icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {!isCollapsed && <span className="truncate">Team attendance</span>}
            </Link>
          </PermissionGuard>

          {/* Profile */}
          <Link
            href="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-100 hover:bg-indigo-800/50 hover:text-white transition-all duration-200 group active:scale-[0.98]"
            title="My Profile"
          >
            <svg
              className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-label="Profile icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {!isCollapsed && (
              <span className="truncate">Profile</span>
            )}
          </Link>
        </nav>

        {/* User Profile Section */}
        <div className="relative p-3 border-t border-indigo-600/30 backdrop-blur-sm bg-indigo-900/50">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <Link
              href="/dashboard/profile"
              onClick={() => setIsOpen(false)}
              className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer"
              title="View Profile"
            >
              {authLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-white font-semibold text-sm">
                  {user?.employee?.first_name
                    ? getInitial(user.employee.first_name)
                    : "U"}
                </span>
              )}
            </Link>

            {!isCollapsed && (
              <Link
                href="/dashboard/profile"
                onClick={() => setIsOpen(false)}
                className="flex-1 min-w-0 transition-opacity duration-300 text-left hover:opacity-80 cursor-pointer"
              >
                {authLoading ? (
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
                          user.employee.last_name,
                        )
                        : "User"}
                    </p>
                    {user?.employee?.work_email && (
                      <p className="text-xs text-indigo-200 truncate">
                        {user.employee.work_email}
                      </p>
                    )}
                  </>
                )}
              </Link>
            )}

            {/* Logout Button */}
            {!isCollapsed && (
              <button
                onClick={logout}
                className="p-2 rounded-md text-indigo-300 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 flex-shrink-0 hover:scale-110"
                title="Logout"
                aria-label="Logout"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
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
          className="lg:hidden absolute top-4 right-4 text-white hover:bg-white/10 p-1 rounded-md transition-colors"
          aria-label="Close menu"
          title="Close menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
