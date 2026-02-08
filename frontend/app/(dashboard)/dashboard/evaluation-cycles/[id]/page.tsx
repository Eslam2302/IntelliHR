"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEntity } from "@/hooks/useEntity";
import { getEvaluationCycle } from "@/services/api/evaluation-cycles";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";
import type { EvaluationCycle } from "@/lib/types/evaluation-cycle";

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
        draft: { bg: "bg-gray-100", text: "text-gray-800" },
        published: { bg: "bg-blue-100", text: "text-blue-800" },
        self_assessment_open: { bg: "bg-yellow-100", text: "text-yellow-800" },
        manager_review_open: { bg: "bg-orange-100", text: "text-orange-800" },
        calibration: { bg: "bg-purple-100", text: "text-purple-800" },
        completed: { bg: "bg-green-100", text: "text-green-800" },
        cancelled: { bg: "bg-red-100", text: "text-red-800" },
    };
    const s = map[status] ?? { bg: "bg-gray-100", text: "text-gray-800" };
    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${s.bg} ${s.text}`}>
            {status.replace(/_/g, " ")}
        </span>
    );
}

export default function EvaluationCycleViewPage() {
    const params = useParams();
    const id = parseId(params.id);
    const { data: evaluationCycle, isLoading, error } = useEntity<EvaluationCycle>({
        fetchFunction: getEvaluationCycle,
        entityId: id,
    });

    if (id === null) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Invalid evaluation cycle ID</p>
                <Link href="/dashboard/evaluation-cycles" className="text-indigo-600 hover:underline">
                    Back to evaluation cycles
                </Link>
            </div>
        );
    }

    if (isLoading && !evaluationCycle) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (error && !evaluationCycle) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/dashboard/evaluation-cycles" className="text-indigo-600 hover:underline">
                    Back to evaluation cycles
                </Link>
            </div>
        );
    }

    if (!evaluationCycle) return null;

    const typeMap: Record<string, string> = {
        annual: "Annual",
        semi_annual: "Semi-Annual",
        quarterly: "Quarterly",
        probation: "Probation",
    };

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title={evaluationCycle.name}
                description={`Evaluation cycle #${evaluationCycle.id}`}
                action={
                    <PermissionGuard permission={PERMISSIONS.EVALUATION_CYCLES.EDIT}>
                        <Link
                            href={`/dashboard/evaluation-cycles/${evaluationCycle.id}/edit`}
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
                        <DetailRow label="Name" value={evaluationCycle.name} />
                        <DetailRow label="Type" value={typeMap[evaluationCycle.type] ?? evaluationCycle.type} />
                        <DetailRow label="Year" value={evaluationCycle.year} />
                        <DetailRow label="Period" value={evaluationCycle.period ?? "—"} />
                        <DetailRow label="Status" value={statusBadge(evaluationCycle.status)} />
                        {evaluationCycle.dates && (
                            <>
                                <DetailRow
                                    label="Start date"
                                    value={evaluationCycle.dates.start_date ? new Date(evaluationCycle.dates.start_date).toLocaleDateString() : null}
                                />
                                <DetailRow
                                    label="End date"
                                    value={evaluationCycle.dates.end_date ? new Date(evaluationCycle.dates.end_date).toLocaleDateString() : null}
                                />
                                <DetailRow
                                    label="Self assessment deadline"
                                    value={evaluationCycle.dates.self_assessment_deadline ? new Date(evaluationCycle.dates.self_assessment_deadline).toLocaleDateString() : null}
                                />
                                <DetailRow
                                    label="Manager review deadline"
                                    value={evaluationCycle.dates.manager_review_deadline ? new Date(evaluationCycle.dates.manager_review_deadline).toLocaleDateString() : null}
                                />
                                <DetailRow
                                    label="Calibration deadline"
                                    value={evaluationCycle.dates.calibration_deadline ? new Date(evaluationCycle.dates.calibration_deadline).toLocaleDateString() : null}
                                />
                                <DetailRow
                                    label="Final review deadline"
                                    value={evaluationCycle.dates.final_review_deadline ? new Date(evaluationCycle.dates.final_review_deadline).toLocaleDateString() : null}
                                />
                            </>
                        )}
                        <DetailRow label="Include self assessment" value={evaluationCycle.include_self_assessment ? "Yes" : "No"} />
                        <DetailRow label="Include goals" value={evaluationCycle.include_goals ? "Yes" : "No"} />
                        <DetailRow
                            label="Created by"
                            value={
                                evaluationCycle.created_by ? (
                                    <Link href={`/dashboard/employees/${evaluationCycle.created_by.id}`} className="text-indigo-600 hover:underline">
                                        {getEmployeeDisplayLabel(evaluationCycle.created_by, evaluationCycle.created_by.id)}
                                    </Link>
                                ) : null
                            }
                        />
                        <DetailRow label="Description" value={evaluationCycle.description ? <div className="whitespace-pre-wrap">{evaluationCycle.description}</div> : null} />
                        <DetailRow label="Created" value={evaluationCycle.created_at ? new Date(evaluationCycle.created_at).toLocaleString() : null} />
                        <DetailRow label="Updated" value={evaluationCycle.updated_at ? new Date(evaluationCycle.updated_at).toLocaleString() : null} />
                    </dl>
                </div>
            </div>
        </div>
    );
}
