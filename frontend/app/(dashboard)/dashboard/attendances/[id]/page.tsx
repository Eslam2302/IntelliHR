"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getAttendance } from "@/services/api/attendances";
import { useEntity } from "@/hooks/useEntity";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import type { Attendance } from "@/lib/types/attendance";

function formatDate(s: string | null | undefined): string {
    if (!s) return "—";
    const d = new Date(s);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatTime(s: string | null | undefined): string {
    if (!s) return "—";
    const d = new Date(s);
    return isNaN(d.getTime()) ? "—" : d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="py-3 flex flex-col sm:flex-row sm:gap-4 border-b border-gray-100 last:border-0">
            <dt className="text-sm font-medium text-gray-500 shrink-0 sm:w-40">{label}</dt>
            <dd className="text-sm text-gray-900 mt-0.5 sm:mt-0">{value ?? "—"}</dd>
        </div>
    );
}

const statusLabels: Record<string, string> = {
    present: "Present",
    absent: "Absent",
    half_day: "Half day",
    on_leave: "On leave",
    late: "Late",
};

export default function AttendanceViewPage() {
    const params = useParams();
    const id = Number(params.id);
    const { data: attendance, isLoading, error } = useEntity<Attendance>({
        fetchFunction: getAttendance,
        entityId: id,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading attendance...</div>
            </div>
        );
    }

    if (error || !attendance) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-gray-500">{error || "Attendance not found"}</p>
                <Link href="/dashboard/attendances" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    ← Back to attendances
                </Link>
            </div>
        );
    }

    return (
        <ProtectedPage permission={PERMISSIONS.ATTENDANCES.VIEW}>
            <div className="space-y-6 max-w-3xl mx-auto">
                <PageHeader
                    title={`Attendance #${attendance.id}`}
                    description={formatDate(attendance.date)}
                    action={
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard/attendances" className="text-gray-600 hover:text-gray-900 font-medium">
                                ← Back to list
                            </Link>
                            <PermissionGuard permission={PERMISSIONS.ATTENDANCES.EDIT}>
                                <Link
                                    href={`/dashboard/attendances/${attendance.id}/edit`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                </Link>
                            </PermissionGuard>
                        </div>
                    }
                />
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <dl className="px-6 divide-y divide-gray-100">
                        <DetailRow
                            label="Employee"
                            value={
                                attendance.employee_id ? (
                                    <Link href={`/dashboard/employees/${attendance.employee_id}`} className="text-indigo-600 hover:text-indigo-800 font-medium">
                                        {attendance.employee?.name ?? `Employee #${attendance.employee_id}`}
                                    </Link>
                                ) : null
                            }
                        />
                        <DetailRow label="Date" value={formatDate(attendance.date)} />
                        <DetailRow label="Check-in" value={formatTime(attendance.check_in)} />
                        <DetailRow label="Check-out" value={formatTime(attendance.check_out)} />
                        <DetailRow label="Worked hours" value={attendance.worked_hours != null ? `${attendance.worked_hours}h` : null} />
                        <DetailRow
                            label="Status"
                            value={
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium capitalize bg-gray-100 text-gray-800">
                                    {statusLabels[attendance.status] ?? attendance.status}
                                </span>
                            }
                        />
                        <DetailRow label="Break (min)" value={attendance.break_duration_minutes} />
                        <DetailRow label="Overtime (h)" value={attendance.overtime_hours} />
                        <DetailRow label="Late" value={attendance.is_late ? "Yes" : "No"} />
                        <DetailRow label="Location" value={attendance.location} />
                        <DetailRow label="Notes" value={attendance.notes} />
                    </dl>
                </div>
            </div>
        </ProtectedPage>
    );
}
