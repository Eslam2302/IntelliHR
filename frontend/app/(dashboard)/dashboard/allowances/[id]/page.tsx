"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEntity } from "@/hooks/useEntity";
import { getAllowance } from "@/services/api/allowances";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Allowance } from "@/lib/types/allowance";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="py-3 border-b border-gray-100 last:border-0">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900">{value ?? "—"}</dd>
        </div>
    );
}

export default function AllowanceViewPage() {
    const params = useParams();
    const id = Number(params.id);
    const { data: allowance, isLoading, error } = useEntity<Allowance>({
        fetchFunction: getAllowance,
        entityId: id,
    });

    if (isLoading && !allowance) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (error && !allowance) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/dashboard/allowances" className="text-indigo-600 hover:underline">
                    Back to allowances
                </Link>
            </div>
        );
    }

    if (!allowance) return null;

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title={`Allowance #${allowance.id}`}
                description={getEmployeeDisplayLabel(allowance.employee, allowance.employee_id)}
                action={
                    <PermissionGuard permission={PERMISSIONS.ALLOWANCES.EDIT}>
                        <Link
                            href={`/dashboard/allowances/${allowance.id}/edit`}
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
                                allowance.employee_id ? (
                                    <Link href={`/dashboard/employees/${allowance.employee_id}`} className="text-indigo-600 hover:underline">
                                        {getEmployeeDisplayLabel(allowance.employee, allowance.employee_id)}
                                    </Link>
                                ) : null
                            }
                        />
                        <DetailRow
                            label="Payroll"
                            value={
                                allowance.payroll_id && allowance.payroll ? (
                                    <Link href={`/dashboard/payrolls/${allowance.payroll_id}`} className="text-indigo-600 hover:underline">
                                        {allowance.payroll.year}/{allowance.payroll.month}
                                    </Link>
                                ) : "—"
                            }
                        />
                        <DetailRow label="Type" value={allowance.type} />
                        <DetailRow
                            label="Amount"
                            value={allowance.amount != null ? new Intl.NumberFormat("en-US", { minimumFractionDigits: 0 }).format(allowance.amount) : null}
                        />
                        <DetailRow
                            label="Created"
                            value={allowance.created_at ? new Date(allowance.created_at).toLocaleString() : null}
                        />
                        <DetailRow
                            label="Updated"
                            value={allowance.updated_at ? new Date(allowance.updated_at).toLocaleString() : null}
                        />
                    </dl>
                </div>
            </div>
        </div>
    );
}
