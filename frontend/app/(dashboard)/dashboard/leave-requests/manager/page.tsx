"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getManagerDashboard, managerApprove } from "@/services/api/leave-requests";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import type { LeaveRequest } from "@/services/api/leave-requests";

const STATUS_OPTIONS = [
    { value: "", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "manager_approved", label: "Manager approved" },
    { value: "hr_approved", label: "HR approved" },
    { value: "rejected", label: "Rejected" },
    { value: "cancelled", label: "Cancelled" },
];

export default function LeaveRequestsManagerPage() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState("");
    const [yearFilter, setYearFilter] = useState<string>("");
    const [approvingId, setApprovingId] = useState<number | null>(null);

    const employeeId = user?.employee?.id ?? null;

    useEffect(() => {
        if (!employeeId) {
            setLoading(false);
            setError("You must be linked to an employee to view this page.");
            return;
        }
        setLoading(true);
        setError(null);
        getManagerDashboard(employeeId, {
            status: statusFilter || undefined,
            year: yearFilter ? parseInt(yearFilter, 10) : undefined,
        })
            .then((r) => setRequests(r.data ?? []))
            .catch((e) => {
                setError(e instanceof Error ? e.message : "Failed to load leave requests");
                setRequests([]);
            })
            .finally(() => setLoading(false));
    }, [employeeId, statusFilter, yearFilter]);

    const handleApprove = async (id: number) => {
        try {
            setApprovingId(id);
            await managerApprove(id);
            const r = await getManagerDashboard(employeeId!, { status: statusFilter || undefined, year: yearFilter ? parseInt(yearFilter, 10) : undefined });
            setRequests(r.data ?? []);
        } catch (e) {
            alert(e instanceof Error ? e.message : "Failed to approve");
        } finally {
            setApprovingId(null);
        }
    };

    if (!employeeId && !loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-gray-500">You must be linked to an employee to view this page.</p>
            </div>
        );
    }

    return (
        <ProtectedPage permission={PERMISSIONS.LEAVE_REQUESTS.VIEW_EMPLOYEES}>
            <div className="space-y-6 bg-gray-50 min-h-full">
                <PageHeader
                    title="Team leave requests"
                    description="Review and approve leave requests for your team"
                />
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                        <div className="flex flex-wrap gap-4 items-center">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    {STATUS_OPTIONS.map((o) => (
                                        <option key={o.value || "all"} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                <input
                                    type="number"
                                    value={yearFilter}
                                    onChange={(e) => setYearFilter(e.target.value)}
                                    placeholder="All"
                                    min={2020}
                                    max={2030}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 w-24"
                                />
                            </div>
                        </div>
                    </div>
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading...</div>
                    ) : error ? (
                        <div className="p-12 text-center">
                            <p className="text-red-500 mb-4">{error}</p>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No leave requests found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {requests.map((lr) => (
                                        <tr key={lr.id}>
                                            <td className="px-6 py-4 text-sm text-gray-900">{lr.employee?.name ?? "—"}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{lr.leave_type?.name ?? "—"}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {lr.start_date ? new Date(lr.start_date).toLocaleDateString() : "—"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {lr.end_date ? new Date(lr.end_date).toLocaleDateString() : "—"}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{lr.days ?? "—"}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{lr.reason ?? "—"}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${
                                                    lr.status === "pending" ? "bg-amber-100 text-amber-800" :
                                                    lr.status === "hr_approved" ? "bg-green-100 text-green-800" :
                                                    lr.status === "manager_approved" ? "bg-blue-100 text-blue-800" :
                                                    lr.status === "rejected" ? "bg-red-100 text-red-800" :
                                                    "bg-gray-100 text-gray-800"
                                                }`}>
                                                    {lr.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {lr.status === "pending" && (
                                                    <button
                                                        onClick={() => handleApprove(lr.id)}
                                                        disabled={approvingId === lr.id}
                                                        className="text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
                                                    >
                                                        {approvingId === lr.id ? "Approving…" : "Approve"}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedPage>
    );
}
