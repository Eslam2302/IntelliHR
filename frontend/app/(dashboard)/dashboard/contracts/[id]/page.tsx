"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEntity } from "@/hooks/useEntity";
import { getContract } from "@/services/api/contracts";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Contract } from "@/lib/types/contract";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="py-3 border-b border-gray-100 last:border-0">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900">{value ?? "—"}</dd>
        </div>
    );
}

export default function ContractViewPage() {
    const params = useParams();
    const id = Number(params.id);
    const { data: contract, isLoading, error } = useEntity<Contract>({
        fetchFunction: getContract,
        entityId: id,
    });

    if (isLoading && !contract) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (error && !contract) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/dashboard/contracts" className="text-indigo-600 hover:underline">
                    Back to contracts
                </Link>
            </div>
        );
    }

    if (!contract) return null;

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title={`Contract #${contract.id}`}
                description={contract.employee?.name ?? `Employee #${contract.employee_id}`}
                action={
                    <PermissionGuard permission={PERMISSIONS.CONTRACTS.EDIT}>
                        <Link
                            href={`/dashboard/contracts/${contract.id}/edit`}
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
                                contract.employee_id ? (
                                    <Link href={`/dashboard/employees/${contract.employee_id}`} className="text-indigo-600 hover:underline">
                                        {contract.employee?.name ?? `Employee #${contract.employee_id}`}
                                    </Link>
                                ) : null
                            }
                        />
                        <DetailRow label="Contract type" value={contract.contract_type?.replace(/_/g, " ")} />
                        <DetailRow
                            label="Start date"
                            value={contract.start_date ? new Date(contract.start_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null}
                        />
                        <DetailRow
                            label="End date"
                            value={contract.end_date ? new Date(contract.end_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Ongoing"}
                        />
                        <DetailRow
                            label="Salary"
                            value={contract.salary != null ? new Intl.NumberFormat("en-US", { minimumFractionDigits: 0 }).format(contract.salary) : null}
                        />
                        <DetailRow label="Probation period (days)" value={contract.probation_period_days} />
                        <DetailRow label="Terms" value={contract.terms} />
                        <DetailRow
                            label="Created"
                            value={contract.created_at ? new Date(contract.created_at).toLocaleString() : null}
                        />
                        <DetailRow
                            label="Updated"
                            value={contract.updated_at ? new Date(contract.updated_at).toLocaleString() : null}
                        />
                    </dl>
                </div>
            </div>
        </div>
    );
}
