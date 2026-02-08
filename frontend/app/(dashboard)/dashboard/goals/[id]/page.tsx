"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEntity } from "@/hooks/useEntity";
import { getGoal } from "@/services/api/goals";
import { getGoalProgressUpdates, createGoalProgressUpdate } from "@/services/api/goal-progress-updates";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";
import type { Goal } from "@/lib/types/goal";
import type { GoalProgressUpdate } from "@/lib/types/goal-progress-update";

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

const PROGRESS_STATUS_OPTIONS = [
    { value: "on_track", label: "On track" },
    { value: "at_risk", label: "At risk" },
    { value: "blocked", label: "Blocked" },
    { value: "completed", label: "Completed" },
];

function statusBadge(status: string | null | undefined) {
    if (!status) return <span className="text-gray-500">—</span>;
    const map: Record<string, { bg: string; text: string }> = {
        not_started: { bg: "bg-gray-100", text: "text-gray-800" },
        in_progress: { bg: "bg-blue-100", text: "text-blue-800" },
        at_risk: { bg: "bg-yellow-100", text: "text-yellow-800" },
        completed: { bg: "bg-green-100", text: "text-green-800" },
        cancelled: { bg: "bg-red-100", text: "text-red-800" },
        on_track: { bg: "bg-green-100", text: "text-green-800" },
        blocked: { bg: "bg-red-100", text: "text-red-800" },
    };
    const s = map[status] ?? { bg: "bg-gray-100", text: "text-gray-800" };
    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${s.bg} ${s.text}`}>
            {status.replace(/_/g, " ")}
        </span>
    );
}

function progressUpdateStatusBadge(status: string) {
    return statusBadge(status);
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

            <GoalProgressUpdatesSection goalId={goal.id} />
        </div>
    );
}

function GoalProgressUpdatesSection({ goalId }: { goalId: number }) {
    const [updates, setUpdates] = useState<GoalProgressUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState({
        update_note: "",
        progress_percentage: 0,
        status: "on_track" as "on_track" | "at_risk" | "blocked" | "completed",
        update_date: new Date().toISOString().slice(0, 10),
    });

    const loadUpdates = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getGoalProgressUpdates({ goal_id: goalId, perPage: 50 });
            setUpdates(res.data ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load progress updates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUpdates();
    }, [goalId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await createGoalProgressUpdate(goalId, {
                update_note: form.update_note,
                progress_percentage: form.progress_percentage,
                status: form.status,
                update_date: form.update_date || undefined,
            });
            setForm({ update_note: "", progress_percentage: 0, status: "on_track", update_date: new Date().toISOString().slice(0, 10) });
            setShowForm(false);
            await loadUpdates();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to add progress update");
        } finally {
            setSubmitting(false);
        }
    };

    const updatedByLabel = (u: GoalProgressUpdate) => {
        const by = u.updated_by;
        if (!by) return "—";
        return (by.name ?? [by.first_name, by.last_name].filter(Boolean).join(" ")) || `#${by.id}`;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress updates</h2>
                {error && (
                    <p className="text-sm text-red-600 mb-4">{error}</p>
                )}
                <PermissionGuard permission={PERMISSIONS.GOAL_PROGRESS_UPDATES.CREATE}>
                    {!showForm ? (
                        <button
                            type="button"
                            onClick={() => setShowForm(true)}
                            className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                        >
                            Add progress update
                        </button>
                    ) : (
                        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Update note</label>
                                <textarea
                                    value={form.update_note}
                                    onChange={(e) => setForm((f) => ({ ...f, update_note: e.target.value }))}
                                    rows={3}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Progress %</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={form.progress_percentage}
                                        onChange={(e) => setForm((f) => ({ ...f, progress_percentage: Number(e.target.value) || 0 }))}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as GoalProgressUpdate["status"] }))}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    >
                                        {PROGRESS_STATUS_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Update date</label>
                                    <input
                                        type="date"
                                        value={form.update_date}
                                        onChange={(e) => setForm((f) => ({ ...f, update_date: e.target.value }))}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
                                >
                                    {submitting ? "Saving…" : "Save"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </PermissionGuard>
                <PermissionGuard permission={PERMISSIONS.GOAL_PROGRESS_UPDATES.VIEW_ALL}>
                    {loading ? (
                        <p className="text-sm text-gray-500">Loading progress updates…</p>
                    ) : updates.length === 0 ? (
                        <p className="text-sm text-gray-500">No progress updates yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                                        <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                                        <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase">Updated by</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {updates.map((u) => (
                                        <tr key={u.id}>
                                            <td className="py-2 text-sm text-gray-900">{u.update_date ? new Date(u.update_date).toLocaleDateString() : "—"}</td>
                                            <td className="py-2 text-sm text-gray-700 max-w-xs truncate">{u.update_note || "—"}</td>
                                            <td className="py-2 text-sm text-gray-900">{u.progress_percentage}%</td>
                                            <td className="py-2">{progressUpdateStatusBadge(u.status)}</td>
                                            <td className="py-2 text-sm text-gray-600">{updatedByLabel(u)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </PermissionGuard>
            </div>
        </div>
    );
}
