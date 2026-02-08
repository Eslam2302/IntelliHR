"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardIcons } from "@/components/dashboard/DashboardIcons";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { getHome } from "@/services/api/home";
import { getMyLeaveRequests, getManagerDashboard } from "@/services/api/leave-requests";
import { getMyRecentAttendances } from "@/services/api/attendances";
import { getEmployees } from "@/services/api/employees";
import { getGoals } from "@/services/api/goals";
import { getPerformanceReviews } from "@/services/api/performance-reviews";
import { getApplicants } from "@/services/api/applicants";
import type { HomeInfo } from "@/services/api/home";
import type { LeaveRequest } from "@/services/api/leave-requests";
import type { Attendance } from "@/lib/types/attendance";
import type { Employee } from "@/lib/types/employee";
import type { Goal } from "@/lib/types/goal";
import type { PerformanceReview } from "@/lib/types/performance-review";
import type { Applicant } from "@/lib/types/applicant";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";

export default function DashboardPage() {
    const { user } = useAuth();
    const { hasPermission, isLoadingPermissions, permissions } = usePermissions();

    const [home, setHome] = useState<HomeInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [myLeaveRequests, setMyLeaveRequests] = useState<LeaveRequest[]>([]);
    const [myAttendances, setMyAttendances] = useState<Attendance[]>([]);
    const [pendingApprovals, setPendingApprovals] = useState<LeaveRequest[]>([]);
    const [recentEmployees, setRecentEmployees] = useState<Employee[]>([]);
    const [recentGoals, setRecentGoals] = useState<Goal[]>([]);
    const [recentReviews, setRecentReviews] = useState<PerformanceReview[]>([]);
    const [recentApplicants, setRecentApplicants] = useState<Applicant[]>([]);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            if (isLoadingPermissions) return;

            try {
                const base = await Promise.all([
                    getHome(),
                    getMyLeaveRequests({ status: "pending" }).catch(() => []),
                    getMyRecentAttendances(5).catch(() => []),
                ]);
                if (cancelled) return;
                setHome(base[0]);
                setMyLeaveRequests(Array.isArray(base[1]) ? base[1] : []);
                setMyAttendances(Array.isArray(base[2]) ? base[2] : []);

                const managerId = user?.employee?.id;
                const tasks: Promise<unknown>[] = [];

                if (hasPermission(PERMISSIONS.LEAVE_REQUESTS.VIEW_EMPLOYEES) && managerId) {
                    tasks.push(
                        getManagerDashboard(managerId, { status: "pending" })
                            .then((r) => { if (!cancelled) setPendingApprovals(r.data ?? []); })
                            .catch(() => { if (!cancelled) setPendingApprovals([]); })
                    );
                }
                if (hasPermission(PERMISSIONS.EMPLOYEES.VIEW_ALL)) {
                    tasks.push(
                        getEmployees({ perPage: 5, sortBy: "created_at", sortOrder: "desc" })
                            .then((r) => { if (!cancelled) setRecentEmployees(r.data ?? []); })
                            .catch(() => { if (!cancelled) setRecentEmployees([]); })
                    );
                }
                if (hasPermission(PERMISSIONS.GOALS.VIEW_ALL)) {
                    tasks.push(
                        getGoals({ perPage: 5, sortBy: "created_at", sortOrder: "desc" })
                            .then((r) => { if (!cancelled) setRecentGoals(r.data ?? []); })
                            .catch(() => { if (!cancelled) setRecentGoals([]); })
                    );
                }
                if (hasPermission(PERMISSIONS.PERFORMANCE_REVIEWS.VIEW_ALL)) {
                    tasks.push(
                        getPerformanceReviews({ perPage: 5, sortBy: "created_at", sortOrder: "desc" })
                            .then((r) => { if (!cancelled) setRecentReviews(r.data ?? []); })
                            .catch(() => { if (!cancelled) setRecentReviews([]); })
                    );
                }
                if (hasPermission(PERMISSIONS.APPLICANTS.VIEW_ALL)) {
                    tasks.push(
                        getApplicants({ perPage: 5, sortBy: "created_at", sortOrder: "desc" })
                            .then((r) => { if (!cancelled) setRecentApplicants(r.data ?? []); })
                            .catch(() => { if (!cancelled) setRecentApplicants([]); })
                    );
                }

                await Promise.all(tasks);
            } catch {
                if (!cancelled) setHome({ app_name: "IntelliHR", description: "", version: "1.0.0" });
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [user?.employee?.id, isLoadingPermissions, permissions]);

    if (loading && !home) {
        return (
            <div className="flex items-center justify-center min-h-[320px]">
                <p className="text-gray-500">Loading dashboard…</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome hero – everyone */}
            {home && (
                <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 shadow-xl">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12)_0%,_transparent_50%)]" />
                    <div className="relative p-8">
                        <h1 className="text-2xl font-bold text-white tracking-tight">{home.app_name}</h1>
                        {home.description && (
                            <p className="mt-2 max-w-2xl text-sm text-indigo-100">{home.description}</p>
                        )}
                        {home.version && (
                            <span className="mt-4 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                v{home.version}
                            </span>
                        )}
                    </div>
                </section>
            )}

            {/* Personal / self-service – no permission required */}
            <section>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    <span className="h-1 w-8 rounded-full bg-teal-500" />
                    Quick links
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <DashboardCard
                        title="My leave requests"
                        description={
                            myLeaveRequests.length === 0
                                ? "No pending leave requests."
                                : `${myLeaveRequests.length} pending`
                        }
                        href="/dashboard/leave-requests"
                        linkLabel="View all"
                        variant="teal"
                        icon={DashboardIcons.leave}
                    />
                    <DashboardCard
                        title="Recent attendance"
                        description={
                            myAttendances.length === 0
                                ? "No recent attendance records."
                                : `Last ${myAttendances.length} record(s)`
                        }
                        href="/dashboard/attendances"
                        linkLabel="View all"
                        variant="blue"
                        icon={DashboardIcons.attendance}
                    />
                    <DashboardCard
                        title="Profile"
                        description="View and edit your profile."
                        href="/dashboard/profile"
                        linkLabel="Go to profile"
                        variant="violet"
                        icon={DashboardIcons.profile}
                    />
                </div>
            </section>

            {/* Team & approvals – permission-gated */}
            <PermissionGuard permission={PERMISSIONS.LEAVE_REQUESTS.VIEW_EMPLOYEES}>
                <section>
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                        <span className="h-1 w-8 rounded-full bg-amber-500" />
                        Leave approvals
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <DashboardCard
                            title="Pending leave approvals"
                            description={
                                pendingApprovals.length === 0
                                    ? "No requests pending your approval."
                                    : `${pendingApprovals.length} request(s) pending`
                            }
                            href="/dashboard/leave-requests/manager"
                            linkLabel="Manage approvals"
                            variant="amber"
                            icon={DashboardIcons.approval}
                        />
                    </div>
                </section>
            </PermissionGuard>

            {/* HR & people – permission-gated */}
            <PermissionGuard permission={PERMISSIONS.EMPLOYEES.VIEW_ALL}>
                <section>
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                        <span className="h-1 w-8 rounded-full bg-emerald-500" />
                        People
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <DashboardCard
                            title="Recent employees"
                            href="/dashboard/employees"
                            linkLabel="View all employees"
                            variant="emerald"
                            icon={DashboardIcons.people}
                        >
                            {recentEmployees.length === 0 ? (
                                <p className="text-sm text-gray-500">No employees yet.</p>
                            ) : (
                                <ul className="space-y-1.5">
                                    {recentEmployees.slice(0, 5).map((e) => (
                                        <li key={e.id}>
                                            <Link
                                                href={`/dashboard/employees/${e.id}`}
                                                className="text-sm text-emerald-700 hover:underline font-medium"
                                            >
                                                {getEmployeeDisplayLabel(e, e.id)}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </DashboardCard>
                    </div>
                </section>
            </PermissionGuard>

            {/* Goals – permission-gated */}
            <PermissionGuard permission={PERMISSIONS.GOALS.VIEW_ALL}>
                <section>
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                        <span className="h-1 w-8 rounded-full bg-orange-500" />
                        Goals
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <DashboardCard
                            title="Recent goals"
                            href="/dashboard/goals"
                            linkLabel="View all goals"
                            variant="orange"
                            icon={DashboardIcons.goal}
                        >
                            {recentGoals.length === 0 ? (
                                <p className="text-sm text-gray-500">No goals yet.</p>
                            ) : (
                                <ul className="space-y-1.5">
                                    {recentGoals.slice(0, 5).map((g) => (
                                        <li key={g.id}>
                                            <Link
                                                href={`/dashboard/goals/${g.id}`}
                                                className="text-sm text-orange-700 hover:underline font-medium"
                                            >
                                                {g.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </DashboardCard>
                    </div>
                </section>
            </PermissionGuard>

            {/* Performance reviews – permission-gated */}
            <PermissionGuard permission={PERMISSIONS.PERFORMANCE_REVIEWS.VIEW_ALL}>
                <section>
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                        <span className="h-1 w-8 rounded-full bg-rose-500" />
                        Performance
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <DashboardCard
                            title="Recent performance reviews"
                            href="/dashboard/performance-reviews"
                            linkLabel="View all"
                            variant="rose"
                            icon={DashboardIcons.performance}
                        >
                            {recentReviews.length === 0 ? (
                                <p className="text-sm text-gray-500">No reviews yet.</p>
                            ) : (
                                <ul className="space-y-1.5">
                                    {recentReviews.slice(0, 5).map((pr) => (
                                        <li key={pr.id}>
                                            <Link
                                                href={`/dashboard/performance-reviews/${pr.id}`}
                                                className="text-sm text-rose-700 hover:underline font-medium"
                                            >
                                                {pr.employee
                                                    ? getEmployeeDisplayLabel(pr.employee, pr.employee.id)
                                                    : `Review #${pr.id}`}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </DashboardCard>
                    </div>
                </section>
            </PermissionGuard>

            {/* Recruitment – permission-gated */}
            <PermissionGuard permission={PERMISSIONS.APPLICANTS.VIEW_ALL}>
                <section>
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                        <span className="h-1 w-8 rounded-full bg-sky-500" />
                        Recruitment
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <DashboardCard
                            title="Recent applicants"
                            href="/dashboard/applicants"
                            linkLabel="View all applicants"
                            variant="sky"
                            icon={DashboardIcons.recruitment}
                        >
                            {recentApplicants.length === 0 ? (
                                <p className="text-sm text-gray-500">No applicants yet.</p>
                            ) : (
                                <ul className="space-y-1.5">
                                    {recentApplicants.slice(0, 5).map((a) => (
                                        <li key={a.id}>
                                            <Link
                                                href={`/dashboard/applicants/${a.id}`}
                                                className="text-sm text-sky-700 hover:underline font-medium"
                                            >
                                                {a.first_name} {a.last_name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </DashboardCard>
                    </div>
                </section>
            </PermissionGuard>

            {/* Operations – only show section if user has at least one of these */}
            <PermissionGuard
                permissions={[
                    PERMISSIONS.PAYROLLS.VIEW_ALL,
                    PERMISSIONS.DOCUMENTS.VIEW_ALL,
                    PERMISSIONS.ASSETS.VIEW_ALL,
                    PERMISSIONS.EXPENSES.VIEW_ALL,
                ]}
                requireAll={false}
            >
                <section>
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                        <span className="h-1 w-8 rounded-full bg-slate-500" />
                        Operations
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <PermissionGuard permission={PERMISSIONS.PAYROLLS.VIEW_ALL}>
                            <DashboardCard
                                title="Payroll"
                                description="View and manage payroll."
                                href="/dashboard/payrolls"
                                linkLabel="View payrolls"
                                variant="emerald"
                                icon={DashboardIcons.payroll}
                            />
                        </PermissionGuard>
                        <PermissionGuard permission={PERMISSIONS.DOCUMENTS.VIEW_ALL}>
                            <DashboardCard
                                title="Documents"
                                description="Company documents."
                                href="/dashboard/documents"
                                linkLabel="View documents"
                                variant="slate"
                                icon={DashboardIcons.documents}
                            />
                        </PermissionGuard>
                        <PermissionGuard permission={PERMISSIONS.ASSETS.VIEW_ALL}>
                            <DashboardCard
                                title="Assets"
                                description="Assets and assignments."
                                href="/dashboard/assets"
                                linkLabel="View assets"
                                variant="indigo"
                                icon={DashboardIcons.assets}
                            />
                        </PermissionGuard>
                        <PermissionGuard permission={PERMISSIONS.EXPENSES.VIEW_ALL}>
                            <DashboardCard
                                title="Expenses"
                                description="Expense management."
                                href="/dashboard/expenses"
                                linkLabel="View expenses"
                                variant="amber"
                                icon={DashboardIcons.expenses}
                            />
                        </PermissionGuard>
                    </div>
                </section>
            </PermissionGuard>

            {/* Activity log – auth only (no permission in system) */}
            <section>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    <span className="h-1 w-8 rounded-full bg-indigo-500" />
                    System
                </h2>
                <DashboardCard
                    title="Activity log"
                    description="View system activity and audit trail."
                    href="/dashboard/activity-log"
                    linkLabel="View activity log"
                    variant="indigo"
                    icon={DashboardIcons.activity}
                />
            </section>
        </div>
    );
}
