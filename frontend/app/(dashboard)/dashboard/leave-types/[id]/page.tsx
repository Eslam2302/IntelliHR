"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getLeaveType } from "@/services/api/leave-types";
import { useEntity } from "@/hooks/useEntity";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import type { LeaveType } from "@/lib/types/leave-type";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="py-3 flex flex-col sm:flex-row sm:gap-4 border-b border-gray-100 last:border-0">
            <dt className="text-sm font-medium text-gray-500 shrink-0 sm:w-48">{label}</dt>
            <dd className="text-sm text-gray-900 mt-0.5 sm:mt-0">{value ?? "—"}</dd>
        </div>
    );
}

export default function LeaveTypeViewPage() {
    const params = useParams();
    const id = Number(params.id);
    const { data: leaveType, isLoading, error } = useEntity<LeaveType>({
        fetchFunction: getLeaveType,
        entityId: id,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500">Loading leave type...</div>
            </div>
        );
    }

    if (error || !leaveType) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <p className="text-gray-500">{error || "Leave type not found"}</p>
                <Link href="/dashboard/leave-types" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    ← Back to list
                </Link>
            </div>
        );
    }

    return (
        <ProtectedPage permission={PERMISSIONS.LEAVE_TYPES.VIEW}>
            <div className="space-y-6 max-w-3xl mx-auto">
                <PageHeader
                    title={leaveType.name}
                    description={`Code: ${leaveType.code}`}
                    action={
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard/leave-types" className="text-gray-600 hover:text-gray-900 font-medium">
                                ← Back to list
                            </Link>
                            <PermissionGuard permission={PERMISSIONS.LEAVE_TYPES.EDIT}>
                                <Link
                                    href={`/dashboard/leave-types/${leaveType.id}/edit`}
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
                        <DetailRow label="Name" value={leaveType.name} />
                        <DetailRow label="Code" value={leaveType.code} />
                        <DetailRow label="Description" value={leaveType.description} />
                        <DetailRow label="Annual entitlement (days)" value={leaveType.annual_entitlement} />
                        <DetailRow label="Accrual policy" value={leaveType.accrual_policy} />
                        <DetailRow label="Carry over limit (days)" value={leaveType.carry_over_limit} />
                        <DetailRow label="Min request days" value={leaveType.min_request_days} />
                        <DetailRow label="Max request days" value={leaveType.max_request_days} />
                        <DetailRow label="Requires HR approval" value={leaveType.requires_hr_approval ? "Yes" : "No"} />
                        <DetailRow label="Requires attachment" value={leaveType.requires_attachment ? "Yes" : "No"} />
                        <DetailRow label="Payment type" value={leaveType.payment_type?.replace("_", " ")} />
                        <DetailRow label="Active" value={leaveType.is_active ? "Yes" : "No"} />
                    </dl>
                </div>
            </div>
        </ProtectedPage>
    );
}
