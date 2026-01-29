"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getMyLeaveRequests } from "@/services/api/leave-requests";
import { PageHeader } from "@/components/ui/PageHeader";
import type { LeaveRequest } from "@/services/api/leave-requests";

const STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    manager_approved: "Manager approved",
    hr_approved: "HR approved",
    rejected: "Rejected",
    cancelled: "Cancelled",
};

export default function MyLeaveRequestsPage() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const employeeId = user?.employee_id ?? user?.employee?.id ?? null;

    useEffect(() => {
        if (!employeeId) {
            setLoading(false);
            setError("You must be linked to an employee to view leave requests.");
            return;
        }
        setLoading(true);
        setError(null);
        getMyLeaveRequests()
            .then((data) => setRequests(Array.isArray(data) ? data : []))
            .catch((e) => {
                setError(e instanceof Error ? e.message : "Failed to load leave requests");
                setRequests([]);
            })
            .finally(() => setLoading(false));
    }, [employeeId]);

    if (!employeeId && !loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-gray-500">You must be linked to an employee to view leave requests.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title="My leave requests"
                description="View and create your leave requests"
                action={
                    <Link
                        href="/dashboard/leave-requests/new"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create request
                    </Link>
                }
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading && requests.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">Loading…</div>
                ) : error && requests.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button
                            onClick={() => {
                                setLoading(true);
                                getMyLeaveRequests()
                                    .then((d) => setRequests(Array.isArray(d) ? d : []))
                                    .catch(() => setRequests([]))
                                    .finally(() => setLoading(false));
                            }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Retry
                        </button>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 mb-4">You have no leave requests yet.</p>
                        <Link
                            href="/dashboard/leave-requests/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create request
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {requests.map((r) => (
                                    <tr key={r.id}>
                                        <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                            {r.leave_type?.name ?? r.leave_type?.code ?? "—"}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-600">
                                            {r.start_date ? new Date(r.start_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-600">
                                            {r.end_date ? new Date(r.end_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-600">{r.days ?? "—"}</td>
                                        <td className="px-6 py-3">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${
                                                    r.status === "hr_approved"
                                                        ? "bg-emerald-100 text-emerald-800"
                                                        : r.status === "rejected" || r.status === "cancelled"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-amber-100 text-amber-800"
                                                }`}
                                            >
                                                {STATUS_LABELS[r.status] ?? r.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-500">
                                            {r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
