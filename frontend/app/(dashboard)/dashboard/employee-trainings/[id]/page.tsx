"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEntity } from "@/hooks/useEntity";
import { getEmployeeTraining } from "@/services/api/employee-trainings";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import type { EmployeeTraining } from "@/lib/types/employee-training";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="py-3 border-b border-gray-100 last:border-0">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900">{value ?? "—"}</dd>
        </div>
    );
}

function parseId(param: string | string[] | undefined): number | null {
    const raw = Array.isArray(param) ? param[0] : param;
    if (typeof raw !== "string" || raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
}

export default function EmployeeTrainingViewPage() {
    const params = useParams();
    const id = parseId(params.id);
    const { data: record, isLoading, error } = useEntity<EmployeeTraining>({
        fetchFunction: getEmployeeTraining,
        entityId: id,
    });

    if (id === null) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Invalid record ID</p>
                <Link href="/dashboard/employee-trainings" className="text-indigo-600 hover:underline">
                    Back to employee trainings
                </Link>
            </div>
        );
    }

    if (isLoading && !record) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (error && !record) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/dashboard/employee-trainings" className="text-indigo-600 hover:underline">
                    Back to employee trainings
                </Link>
            </div>
        );
    }

    if (!record) return null;

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title={`Employee training #${record.id}`}
                description={`${record.employee?.name ?? `Employee #${record.employee_id}`} – ${record.training_session?.title ?? `Session #${record.training_id}`}`}
                action={
                    <PermissionGuard permission={PERMISSIONS.EMPLOYEE_TRAININGS.EDIT}>
                        <Link
                            href={`/dashboard/employee-trainings/${record.id}/edit`}
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
                                <Link href={`/dashboard/employees/${record.employee_id}`} className="text-indigo-600 hover:underline">
                                    {record.employee?.name ?? `Employee #${record.employee_id}`}
                                </Link>
                            }
                        />
                        <DetailRow
                            label="Training session"
                            value={
                                <Link href={`/dashboard/training-sessions/${record.training_id}`} className="text-indigo-600 hover:underline">
                                    {record.training_session?.title ?? `Session #${record.training_id}`}
                                </Link>
                            }
                        />
                        <DetailRow label="Status" value={record.status} />
                        <DetailRow
                            label="Completion date"
                            value={record.completion_date ? new Date(record.completion_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null}
                        />
                        <DetailRow label="Created" value={record.created_at ? new Date(record.created_at).toLocaleString() : null} />
                        <DetailRow label="Updated" value={record.updated_at ? new Date(record.updated_at).toLocaleString() : null} />
                    </dl>
                </div>
            </div>
        </div>
    );
}
