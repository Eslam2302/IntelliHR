"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getEmployee } from "@/services/api/employees";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import type { Employee } from "@/lib/types/employee";
import type { User } from "@/lib/types/user";

type EmployeeWithRelations = Employee & {
  department?: { id: number; name: string } | null;
  job?: { id: number; title: string } | null;
  manager?: { id: number; first_name: string; last_name: string } | null;
};

function formatDate(s: string | null | undefined): string {
  if (!s) return "—";
  const d = new Date(s);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function yearsSince(s: string | null | undefined): number | null {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [employee, setEmployee] = useState<EmployeeWithRelations | null>(null);
  const [loadingEmployee, setLoadingEmployee] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.employee?.id) {
      setLoadingEmployee(false);
      return;
    }
    let cancelled = false;
    getEmployee(user.employee.id)
      .then((data) => {
        if (!cancelled) setEmployee(data as EmployeeWithRelations);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load profile");
      })
      .finally(() => {
        if (!cancelled) setLoadingEmployee(false);
      });
    return () => { cancelled = true; };
  }, [user?.employee?.id]);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 max-w-md mx-auto text-center px-4">
        <p className="text-gray-600">Unable to load your profile.</p>
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  if (!user?.employee) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 max-w-md mx-auto text-center px-4">
        <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
          <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">No profile linked</h1>
        <p className="text-gray-600">Your account is not associated with an employee record. Contact HR if this is unexpected.</p>
        <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const emp = employee ?? user.employee;
  const full = (employee ?? user.employee) as EmployeeWithRelations;
  const isLoading = loadingEmployee && !employee;
  const years = yearsSince(emp.hire_date);
  const statusColors: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    probation: "bg-amber-500/10 text-amber-700 border-amber-200",
    resigned: "bg-slate-500/10 text-slate-600 border-slate-200",
    terminated: "bg-red-500/10 text-red-700 border-red-200",
  };
  const statusStyle = statusColors[emp.employee_status] ?? "bg-gray-500/10 text-gray-700 border-gray-200";
  const personalEmail = (user as User).personal_email ?? (full as unknown as { user?: { personal_email?: string } }).user?.personal_email;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative px-6 py-10 sm:px-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8">
            <div className="flex shrink-0">
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg ring-2 ring-white/20">
                {isLoading ? (
                  <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    {emp.first_name?.charAt(0) ?? "?"}{emp.last_name?.charAt(0) ?? ""}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-6 sm:mt-0 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight truncate">
                {emp.first_name} {emp.last_name}
              </h1>
              {full.department && <p className="mt-1 text-indigo-200 text-lg">{full.department.name}</p>}
              {full.job && <p className="text-indigo-100/90 text-sm mt-0.5">{full.job.title}</p>}
              <div className="flex flex-wrap gap-3 mt-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusStyle}`}>
                  {String(emp.employee_status).charAt(0).toUpperCase() + String(emp.employee_status).slice(1)}
                </span>
                {years != null && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20">
                    {years} {years === 1 ? "year" : "years"} at company
                  </span>
                )}
              </div>
            </div>
            <div className="mt-6 sm:mt-0 sm:ml-auto">
              <PermissionGuard permission={PERMISSIONS.EMPLOYEES.EDIT}>
                <Link
                  href={`/dashboard/employees/${emp.id}/edit`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-semibold shadow-lg hover:bg-indigo-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit profile
                </Link>
              </PermissionGuard>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-amber-800 text-sm">
          {error}
        </div>
      )}

      {/* Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              Personal
            </h2>
          </div>
          <dl className="divide-y divide-gray-100">
            {[
              { label: "Work email", value: emp.work_email },
              { label: "Personal email", value: personalEmail },
              { label: "Phone", value: emp.phone },
              { label: "Gender", value: emp.gender ? emp.gender.charAt(0).toUpperCase() + emp.gender.slice(1) : null },
              { label: "National ID", value: emp.national_id },
              { label: "Birth date", value: formatDate(emp.birth_date) },
              { label: "Address", value: emp.address },
            ].map(({ label, value }) => (
              <div key={label} className="px-6 py-3.5 flex flex-col sm:flex-row sm:gap-4 sm:items-baseline">
                <dt className="text-sm font-medium text-gray-500 shrink-0 sm:w-36">{label}</dt>
                <dd className="text-sm text-gray-900 mt-0.5 sm:mt-0 break-words">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Work */}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              Work
            </h2>
          </div>
          <dl className="divide-y divide-gray-100">
            {[
              {
                label: "Department",
                value: full.department
                  ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium">
                      {full.department.name}
                    </span>
                  )
                  : null,
              },
              {
                label: "Job position",
                value: full.job
                  ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-sm font-medium">
                      {full.job.title}
                    </span>
                  )
                  : null,
              },
              {
                label: "Manager",
                value: full.manager
                  ? (
                    <Link
                      href={`/dashboard/employees/${full.manager.id}`}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
                    >
                      {full.manager.first_name} {full.manager.last_name}
                    </Link>
                  )
                  : null,
              },
              { label: "Hire date", value: formatDate(emp.hire_date) },
            ].map(({ label, value }) => (
              <div key={label} className="px-6 py-3.5 flex flex-col sm:flex-row sm:gap-4 sm:items-baseline">
                <dt className="text-sm font-medium text-gray-500 shrink-0 sm:w-36">{label}</dt>
                <dd className="text-sm text-gray-900 mt-0.5 sm:mt-0">{value ?? "—"}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
