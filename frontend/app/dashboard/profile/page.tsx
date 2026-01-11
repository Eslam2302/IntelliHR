"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user?.employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">No user data available</p>
      </div>
    );
  }

  const employee = user.employee;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">View and manage your profile information</p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-white">
              {employee.first_name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900">
              {employee.first_name} {employee.last_name}
            </h2>
            <p className="text-gray-600 mt-1">{employee.personal_email || user.email}</p>
            {employee.employee_status && (
              <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                {employee.employee_status}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Profile Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg
              className="h-5 w-5 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Personal Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">First Name</label>
              <p className="text-gray-900 mt-1">{employee.first_name || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Name</label>
              <p className="text-gray-900 mt-1">{employee.last_name || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Gender</label>
              <p className="text-gray-900 mt-1">{employee.gender || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Birth Date</label>
              <p className="text-gray-900 mt-1">{formatDate(employee.birth_date)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">National ID</label>
              <p className="text-gray-900 mt-1">{employee.national_id || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg
              className="h-5 w-5 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Contact Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Personal Email</label>
              <p className="text-gray-900 mt-1">{employee.personal_email || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Work Email</label>
              <p className="text-gray-900 mt-1">{user.email || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-gray-900 mt-1">{employee.phone || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Address</label>
              <p className="text-gray-900 mt-1">{employee.address || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg
              className="h-5 w-5 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Employment Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Employee ID</label>
              <p className="text-gray-900 mt-1">{employee.id || user.employee_id || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Hire Date</label>
              <p className="text-gray-900 mt-1">{formatDate(employee.hire_date)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="text-gray-900 mt-1">{employee.employee_status || "N/A"}</p>
            </div>
            {employee.department && (
              <div>
                <label className="text-sm font-medium text-gray-500">Department</label>
                <p className="text-gray-900 mt-1">
                  {employee.department.name || "N/A"}
                </p>
              </div>
            )}
            {employee.job && (
              <div>
                <label className="text-sm font-medium text-gray-500">Job Position</label>
                <p className="text-gray-900 mt-1">{employee.job.title || "N/A"}</p>
              </div>
            )}
          </div>
        </div>

        {/* Manager Information */}
        {employee.manager && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="h-5 w-5 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Manager Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Manager Name</label>
                <p className="text-gray-900 mt-1">
                  {employee.manager.first_name} {employee.manager.last_name}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

