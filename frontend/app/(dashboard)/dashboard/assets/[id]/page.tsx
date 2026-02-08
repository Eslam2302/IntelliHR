"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEntity } from "@/hooks/useEntity";
import { getAsset } from "@/services/api/assets";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Asset } from "@/lib/types/asset";

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

function statusBadge(status: string | null | undefined) {
    if (!status) return <span className="text-gray-500">—</span>;
    const map: Record<string, { bg: string; text: string }> = {
        available: { bg: "bg-green-100", text: "text-green-800" },
        assigned: { bg: "bg-blue-100", text: "text-blue-800" },
        maintenance: { bg: "bg-yellow-100", text: "text-yellow-800" },
        retired: { bg: "bg-gray-100", text: "text-gray-800" },
    };
    const s = map[status] ?? { bg: "bg-gray-100", text: "text-gray-800" };
    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${s.bg} ${s.text}`}>
            {status}
        </span>
    );
}

export default function AssetViewPage() {
    const params = useParams();
    const id = parseId(params.id);
    const { data: asset, isLoading, error } = useEntity<Asset>({
        fetchFunction: getAsset,
        entityId: id,
    });

    if (id === null) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Invalid asset ID</p>
                <Link href="/dashboard/assets" className="text-indigo-600 hover:underline">
                    Back to assets
                </Link>
            </div>
        );
    }

    if (isLoading && !asset) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (error && !asset) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/dashboard/assets" className="text-indigo-600 hover:underline">
                    Back to assets
                </Link>
            </div>
        );
    }

    if (!asset) return null;

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title={asset.name}
                description={`Asset #${asset.id}`}
                action={
                    <PermissionGuard permission={PERMISSIONS.ASSETS.EDIT}>
                        <Link
                            href={`/dashboard/assets/${asset.id}/edit`}
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
                        <DetailRow label="Name" value={asset.name} />
                        <DetailRow label="Serial number" value={asset.serial_number} />
                        <DetailRow label="Condition" value={asset.condition} />
                        <DetailRow label="Status" value={statusBadge(asset.status)} />
                        {asset.current_assignment && (
                            <>
                                <DetailRow
                                    label="Assigned to"
                                    value={
                                        <Link href={`/dashboard/employees/${asset.current_assignment.employee_id}`} className="text-indigo-600 hover:underline">
                                            {asset.current_assignment.employee?.name || 
                                             (asset.current_assignment.employee?.first_name && asset.current_assignment.employee?.last_name
                                                ? `${asset.current_assignment.employee.first_name} ${asset.current_assignment.employee.last_name}`
                                                : `Employee #${asset.current_assignment.employee_id}`)}
                                        </Link>
                                    }
                                />
                                <DetailRow
                                    label="Assigned date"
                                    value={asset.current_assignment.assigned_date ? new Date(asset.current_assignment.assigned_date).toLocaleDateString() : null}
                                />
                                <DetailRow
                                    label="Return date"
                                    value={asset.current_assignment.return_date ? new Date(asset.current_assignment.return_date).toLocaleDateString() : null}
                                />
                            </>
                        )}
                        <DetailRow label="Created" value={asset.created_at ? new Date(asset.created_at).toLocaleString() : null} />
                        <DetailRow label="Updated" value={asset.updated_at ? new Date(asset.updated_at).toLocaleString() : null} />
                    </dl>
                </div>
            </div>
        </div>
    );
}
