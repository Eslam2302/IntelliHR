"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEntity } from "@/hooks/useEntity";
import { getDeduction } from "@/services/api/deductions";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Deduction } from "@/lib/types/deduction";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="py-3 border-b border-gray-100 last:border-0">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900">{value ?? "—"}</dd>
        </div>
    );
}

export default function DeductionViewPage() {
    const params = useParams();
    const id = Number(params.id);
    const { data: deduction, isLoading, error } = useEntity<Deduction>({
        fetchFunction: getDeduction,
        entityId: id,
    });

    if (isLoading && !deduction) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (error && !deduction) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/dashboard/deductions" className="text-indigo-600 hover:underline">
                    Back to deductions
                </Link>
            </div>
        );
    }

    if (!deduction) return null;

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title={`Deduction #${deduction.id}`}
                description={getEmployeeDisplayLabel(deduction.employee, deduction.employee_id)}
                action={
                    <PermissionGuard permission={PERMISSIONS.DEDUCTIONS.EDIT}>
                        <Link
                            href={`/dashboard/deductions/${deduction.id}/edit`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </Link>
                    </PermissionGuard>
                }
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                    <dl className="divide-y divide-gray-100">
                        <DetailRow
                            label="Employee"
                            value={
                                deduction.employee_id ? (
                                    <Link href={`/dashboard/employees/${deduction.employee_id}`} className="text-indigo-600 hover:underline">
                                        {getEmployeeDisplayLabel(deduction.employee, deduction.employee_id)}
                                    </Link>
                                ) : null
                            }
                        />
                        <DetailRow
                            label="Payroll"
                            value={
                                deduction.payroll_id && deduction.payroll ? (
                                    <Link href={`/dashboard/payrolls/${deduction.payroll_id}`} className="text-indigo-600 hover:underline">
                                        {deduction.payroll.year}/{deduction.payroll.month}
                                    </Link>
                                ) : "—"
                            }
                        />
                        <DetailRow label="Type" value={deduction.type} />
                        <DetailRow
                            label="Amount"
                            value={deduction.amount != null ? new Intl.NumberFormat("en-US", { minimumFractionDigits: 0 }).format(deduction.amount) : null}
                        />
                        <DetailRow
                            label="Created"
                            value={deduction.created_at ? new Date(deduction.created_at).toLocaleString() : null}
                        />
                        <DetailRow
                            label="Updated"
                            value={deduction.updated_at ? new Date(deduction.updated_at).toLocaleString() : null}
                        />
                    </dl>
                </div>
            </div>
        </div>
    );
}
