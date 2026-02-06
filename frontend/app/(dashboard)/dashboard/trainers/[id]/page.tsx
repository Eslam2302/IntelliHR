"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEntity } from "@/hooks/useEntity";
import { getTrainer } from "@/services/api/trainers";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Trainer } from "@/lib/types/trainer";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="py-3 border-b border-gray-100 last:border-0">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900">{value ?? "—"}</dd>
        </div>
    );
}

function displayTrainerName(t: Trainer): string {
    if (t.type === "internal" && t.employee) return t.employee.name ?? `Employee #${t.employee_id}`;
    return t.name ?? "—";
}

function parseId(param: string | string[] | undefined): number | null {
    const raw = Array.isArray(param) ? param[0] : param;
    if (typeof raw !== "string" || raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
}

export default function TrainerViewPage() {
    const params = useParams();
    const id = parseId(params.id);
    const { data: trainer, isLoading, error } = useEntity<Trainer>({
        fetchFunction: getTrainer,
        entityId: id,
    });

    if (id === null) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Invalid trainer ID</p>
                <Link href="/dashboard/trainers" className="text-indigo-600 hover:underline">
                    Back to trainers
                </Link>
            </div>
        );
    }

    if (isLoading && !trainer) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (error && !trainer) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/dashboard/trainers" className="text-indigo-600 hover:underline">
                    Back to trainers
                </Link>
            </div>
        );
    }

    if (!trainer) return null;

    const email = trainer.type === "internal" && trainer.employee?.email ? trainer.employee.email : trainer.email;
    const name = displayTrainerName(trainer);

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title={name}
                description={`Trainer #${trainer.id} (${trainer.type})`}
                action={
                    <PermissionGuard permission={PERMISSIONS.TRAINERS.EDIT}>
                        <Link
                            href={`/dashboard/trainers/${trainer.id}/edit`}
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
                        <DetailRow label="Type" value={trainer.type} />
                        {trainer.type === "internal" && trainer.employee_id ? (
                            <DetailRow
                                label="Employee"
                                value={
                                    <Link href={`/dashboard/employees/${trainer.employee_id}`} className="text-indigo-600 hover:underline">
                                        {trainer.employee?.name ?? `Employee #${trainer.employee_id}`}
                                    </Link>
                                }
                            />
                        ) : (
                            <>
                                <DetailRow label="Name" value={trainer.name} />
                                <DetailRow label="Email" value={email} />
                                <DetailRow label="Phone" value={trainer.phone} />
                                <DetailRow label="Company" value={trainer.company} />
                            </>
                        )}
                        <DetailRow label="Created" value={trainer.created_at ? new Date(trainer.created_at).toLocaleString() : null} />
                        <DetailRow label="Updated" value={trainer.updated_at ? new Date(trainer.updated_at).toLocaleString() : null} />
                    </dl>
                </div>
            </div>
        </div>
    );
}
