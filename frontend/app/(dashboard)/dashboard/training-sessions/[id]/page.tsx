"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEntity } from "@/hooks/useEntity";
import { getTrainingSession } from "@/services/api/training-sessions";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import type { TrainingSession } from "@/lib/types/training-session";

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

export default function TrainingSessionViewPage() {
    const params = useParams();
    const id = parseId(params.id);
    const { data: session, isLoading, error } = useEntity<TrainingSession>({
        fetchFunction: getTrainingSession,
        entityId: id,
    });

    if (id === null) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Invalid session ID</p>
                <Link href="/dashboard/training-sessions" className="text-indigo-600 hover:underline">
                    Back to training sessions
                </Link>
            </div>
        );
    }

    if (isLoading && !session) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (error && !session) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/dashboard/training-sessions" className="text-indigo-600 hover:underline">
                    Back to training sessions
                </Link>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title={session.title}
                description={`Session #${session.id}`}
                action={
                    <PermissionGuard permission={PERMISSIONS.TRAINING_SESSIONS.EDIT}>
                        <Link
                            href={`/dashboard/training-sessions/${session.id}/edit`}
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
                        <DetailRow label="Title" value={session.title} />
                        <DetailRow
                            label="Start date"
                            value={session.start_date ? new Date(session.start_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null}
                        />
                        <DetailRow
                            label="End date"
                            value={session.end_date ? new Date(session.end_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null}
                        />
                        <DetailRow
                            label="Trainer"
                            value={
                                session.trainer_id ? (
                                    <Link href={`/dashboard/trainers/${session.trainer_id}`} className="text-indigo-600 hover:underline">
                                        {session.trainer?.name ?? `Trainer #${session.trainer_id}`}
                                    </Link>
                                ) : null
                            }
                        />
                        <DetailRow
                            label="Department"
                            value={
                                session.department_id ? (
                                    <Link href={`/dashboard/departments/${session.department_id}`} className="text-indigo-600 hover:underline">
                                        {session.department?.name ?? `Department #${session.department_id}`}
                                    </Link>
                                ) : null
                            }
                        />
                        <DetailRow label="Description" value={session.description} />
                        <DetailRow label="Created" value={session.created_at ? new Date(session.created_at).toLocaleString() : null} />
                        <DetailRow label="Updated" value={session.updated_at ? new Date(session.updated_at).toLocaleString() : null} />
                    </dl>
                </div>
            </div>
        </div>
    );
}
