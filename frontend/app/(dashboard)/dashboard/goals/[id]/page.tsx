"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEntity } from "@/hooks/useEntity";
import { getGoal } from "@/services/api/goals";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";
import type { Goal } from "@/lib/types/goal";

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
        not_started: { bg: "bg-gray-100", text: "text-gray-800" },
        in_progress: { bg: "bg-blue-100", text: "text-blue-800" },
        at_risk: { bg: "bg-yellow-100", text: "text-yellow-800" },
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

export default function GoalViewPage() {
    const params = useParams();
    const id = parseId(params.id);
    const { data: goal, isLoading, error } = useEntity<Goal>({
        fetchFunction: getGoal,
        entityId: id,
    });

    if (id === null) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Invalid goal ID</p>
                <Link href="/dashboard/goals" className="text-indigo-600 hover:underline">
                    Back to goals
                </Link>
            </div>
        );
    }

    if (isLoading && !goal) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (error && !goal) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/dashboard/goals" className="text-indigo-600 hover:underline">
                    Back to goals
                </Link>
            </div>
        );
    }

    if (!goal) return null;

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title={goal.title}
                description={`Goal #${goal.id}`}
                action={
                    <PermissionGuard permission={PERMISSIONS.GOALS.EDIT}>
                        <Link
                            href={`/dashboard/goals/${goal.id}/edit`}
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
                        <DetailRow label="Title" value={goal.title} />
                        <DetailRow label="Description" value={goal.description ? <div className="whitespace-pre-wrap">{goal.description}</div> : null} />
                        <DetailRow
                            label="Employee"
                            value={
                                goal.employee ? (
                                    <Link href={`/dashboard/employees/${goal.employee.id}`} className="text-indigo-600 hover:underline">
                                        {getEmployeeDisplayLabel(goal.employee, goal.employee.id)}
                                    </Link>
                                ) : goal.employee_id ? (
                                    `Employee #${goal.employee_id}`
                                ) : null
                            }
                        />
                        <DetailRow
                            label="Evaluation Cycle"
                            value={
                                goal.evaluation_cycle ? (
                                    <Link href={`/dashboard/evaluation-cycles/${goal.evaluation_cycle.id}`} className="text-indigo-600 hover:underline">
                                        {goal.evaluation_cycle.name}
                                    </Link>
                                ) : goal.evaluation_cycle_id ? (
                                    `Cycle #${goal.evaluation_cycle_id}`
                                ) : null
                            }
                        />
                        <DetailRow label="Type" value={goal.type ? goal.type.replace(/_/g, " ") : null} />
                        <DetailRow label="Category" value={goal.category ? goal.category.replace(/_/g, " ") : null} />
                        <DetailRow label="Status" value={statusBadge(goal.status)} />
                        <DetailRow label="Progress" value={`${goal.progress_percentage ?? 0}%`} />
                        {(goal.dates || goal.start_date) && (
                            <>
                                <DetailRow
                                    label="Start date"
                                    value={goal.dates?.start_date || goal.start_date ? new Date(goal.dates?.start_date || goal.start_date!).toLocaleDateString() : null}
                                />
                                <DetailRow
                                    label="Target date"
                                    value={goal.dates?.target_date || goal.target_date ? new Date(goal.dates?.target_date || goal.target_date!).toLocaleDateString() : null}
                                />
                            </>
                        )}
                        <DetailRow label="Weight" value={goal.weight} />
                        <DetailRow label="Created" value={goal.created_at ? new Date(goal.created_at).toLocaleString() : null} />
                        <DetailRow label="Updated" value={goal.updated_at ? new Date(goal.updated_at).toLocaleString() : null} />
                    </dl>
                </div>
            </div>
        </div>
    );
}
