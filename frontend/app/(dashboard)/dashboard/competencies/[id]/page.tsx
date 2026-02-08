"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEntity } from "@/hooks/useEntity";
import { getCompetency } from "@/services/api/competencies";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Competency } from "@/lib/types/competency";

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

function statusBadge(isActive: boolean | null | undefined) {
    if (isActive === undefined || isActive === null) return <span className="text-gray-500">—</span>;
    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
            {isActive ? "Active" : "Inactive"}
        </span>
    );
}

export default function CompetencyViewPage() {
    const params = useParams();
    const id = parseId(params.id);
    const { data: competency, isLoading, error } = useEntity<Competency>({
        fetchFunction: getCompetency,
        entityId: id,
    });

    if (id === null) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Invalid competency ID</p>
                <Link href="/dashboard/competencies" className="text-indigo-600 hover:underline">
                    Back to competencies
                </Link>
            </div>
        );
    }

    if (isLoading && !competency) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (error && !competency) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/dashboard/competencies" className="text-indigo-600 hover:underline">
                    Back to competencies
                </Link>
            </div>
        );
    }

    if (!competency) return null;

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title={competency.name}
                description={`Competency #${competency.id}`}
                action={
                    <PermissionGuard permission={PERMISSIONS.COMPETENCIES.EDIT}>
                        <Link
                            href={`/dashboard/competencies/${competency.id}/edit`}
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
                        <DetailRow label="Name" value={competency.name} />
                        <DetailRow label="Description" value={competency.description ? <div className="whitespace-pre-wrap">{competency.description}</div> : null} />
                        <DetailRow label="Category" value={competency.category} />
                        <DetailRow label="Applicable To" value={competency.applicable_to} />
                        <DetailRow label="Weight" value={competency.weight} />
                        <DetailRow label="Display Order" value={competency.display_order} />
                        <DetailRow label="Status" value={statusBadge(competency.is_active)} />
                        <DetailRow
                            label="Rating Descriptors"
                            value={competency.rating_descriptors ? <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(competency.rating_descriptors, null, 2)}</pre> : null}
                        />
                        <DetailRow label="Created" value={competency.created_at ? new Date(competency.created_at).toLocaleString() : null} />
                        <DetailRow label="Updated" value={competency.updated_at ? new Date(competency.updated_at).toLocaleString() : null} />
                    </dl>
                </div>
            </div>
        </div>
    );
}
