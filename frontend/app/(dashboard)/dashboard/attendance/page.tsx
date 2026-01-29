"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    getMyRecentAttendances,
    attendanceCheckIn,
    attendanceCheckOut,
} from "@/services/api/attendances";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Attendance } from "@/lib/types/attendance";

const statusLabels: Record<string, string> = {
    present: "Present",
    absent: "Absent",
    half_day: "Half day",
    on_leave: "On leave",
    late: "Late",
};

export default function AttendanceCheckInPage() {
    const { user } = useAuth();
    const [list, setList] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [action, setAction] = useState<"check-in" | "check-out" | null>(null);

    const employeeId = user?.employee_id ?? user?.employee?.id ?? null;

    const fetchRecent = useCallback(async () => {
        if (!employeeId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await getMyRecentAttendances(5);
            setList(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load attendances");
            setList([]);
        } finally {
            setLoading(false);
        }
    }, [employeeId]);

    useEffect(() => {
        fetchRecent();
    }, [fetchRecent]);

    const today = new Date().toISOString().slice(0, 10);
    const todayRecord = list.find((a) => (a.date || "").toString().slice(0, 10) === today);
    const canCheckIn = !todayRecord;
    const canCheckOut = !!todayRecord && !todayRecord.check_out;

    const handleCheckIn = async () => {
        if (!employeeId) return;
        setAction("check-in");
        try {
            await attendanceCheckIn({});
            await fetchRecent();
        } catch (e) {
            alert(e instanceof Error ? e.message : "Check-in failed");
        } finally {
            setAction(null);
        }
    };

    const handleCheckOut = async () => {
        if (!employeeId) return;
        setAction("check-out");
        try {
            await attendanceCheckOut({});
            await fetchRecent();
        } catch (e) {
            alert(e instanceof Error ? e.message : "Check-out failed");
        } finally {
            setAction(null);
        }
    };

    if (!employeeId && !loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-gray-500">You must be linked to an employee to use check-in.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title="Attendance"
                description="Check in and check out. Your last 5 records are shown below."
            />
            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Today</h2>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleCheckIn}
                            disabled={!canCheckIn || !!action}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {action === "check-in" ? (
                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                            Check in
                        </button>
                        <button
                            onClick={handleCheckOut}
                            disabled={!canCheckOut || !!action}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {action === "check-out" ? (
                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            )}
                            Check out
                        </button>
                    </div>
                    {todayRecord && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                            <p>Check-in: {todayRecord.check_in ? new Date(todayRecord.check_in).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}</p>
                            <p>Check-out: {todayRecord.check_out ? new Date(todayRecord.check_out).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}</p>
                            {todayRecord.worked_hours != null && <p>Hours: {todayRecord.worked_hours}h</p>}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <h2 className="text-lg font-semibold text-gray-900 px-6 py-4 border-b border-gray-200">Last 5 attendances</h2>
                {loading && list.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Loading…</div>
                ) : error && list.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-red-500 mb-2">{error}</p>
                        <button onClick={fetchRecent} className="text-indigo-600 hover:underline">Retry</button>
                    </div>
                ) : list.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No attendance records yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {list.map((a) => (
                                    <tr key={a.id}>
                                        <td className="px-6 py-3 text-sm text-gray-900">
                                            {a.date ? new Date(a.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-600">
                                            {a.check_in ? new Date(a.check_in).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-600">
                                            {a.check_out ? new Date(a.check_out).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-600">
                                            {a.worked_hours != null ? `${a.worked_hours}h` : "—"}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-800">
                                                {statusLabels[a.status] ?? a.status}
                                            </span>
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
