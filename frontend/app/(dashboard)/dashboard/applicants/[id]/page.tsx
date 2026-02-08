"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEntity } from "@/hooks/useEntity";
import {
    getApplicant,
    analyzeResume,
    getApplicantAiAnalysis,
    reAnalyzeResume,
} from "@/services/api/applicants";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Applicant } from "@/lib/types/applicant";

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
        new: { bg: "bg-blue-100", text: "text-blue-800" },
        shortlisted: { bg: "bg-yellow-100", text: "text-yellow-800" },
        interviewed: { bg: "bg-purple-100", text: "text-purple-800" },
        hired: { bg: "bg-emerald-100", text: "text-emerald-800" },
        rejected: { bg: "bg-red-100", text: "text-red-800" },
    };
    const s = map[status] ?? { bg: "bg-gray-100", text: "text-gray-800" };
    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${s.bg} ${s.text}`}>
            {status}
        </span>
    );
}

export default function ApplicantViewPage() {
    const params = useParams();
    const id = parseId(params.id);
    const { data: applicant, isLoading, error, refetch } = useEntity<Applicant>({
        fetchFunction: getApplicant,
        entityId: id,
    });

    if (id === null) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Invalid applicant ID</p>
                <Link href="/dashboard/applicants" className="text-indigo-600 hover:underline">
                    Back to applicants
                </Link>
            </div>
        );
    }

    if (isLoading && !applicant) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (error && !applicant) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/dashboard/applicants" className="text-indigo-600 hover:underline">
                    Back to applicants
                </Link>
            </div>
        );
    }

    if (!applicant) return null;

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title={`${applicant.first_name} ${applicant.last_name}`}
                description={`Applicant #${applicant.id}`}
                action={
                    <PermissionGuard permission={PERMISSIONS.APPLICANTS.EDIT}>
                        <Link
                            href={`/dashboard/applicants/${applicant.id}/edit`}
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
                        <DetailRow label="Name" value={`${applicant.first_name} ${applicant.last_name}`} />
                        <DetailRow label="Email" value={applicant.email} />
                        <DetailRow label="Phone" value={applicant.phone} />
                        <DetailRow
                            label="Job post"
                            value={
                                applicant.job_id ? (
                                    <Link href={`/dashboard/job-posts/${applicant.job_id}`} className="text-indigo-600 hover:underline">
                                        {applicant.job?.title ?? `Job post #${applicant.job_id}`}
                                    </Link>
                                ) : null
                            }
                        />
                        <DetailRow label="Status" value={statusBadge(applicant.status)} />
                        <DetailRow label="Source" value={applicant.source} />
                        <DetailRow label="Experience (years)" value={applicant.experience_years} />
                        <DetailRow
                            label="Current stage"
                            value={
                                applicant.current_stage_id ? (
                                    <Link href={`/dashboard/hiring-stages/${applicant.current_stage_id}`} className="text-indigo-600 hover:underline">
                                        {applicant.current_stage?.stage_name ?? `Stage #${applicant.current_stage_id}`}
                                    </Link>
                                ) : null
                            }
                        />
                        <DetailRow label="Is employee" value={applicant.is_employee ? "Yes" : "No"} />
                        <DetailRow
                            label="Applied at"
                            value={applicant.applied_at ? new Date(applicant.applied_at).toLocaleString() : null}
                        />
                        <DetailRow label="Created" value={applicant.created_at ? new Date(applicant.created_at).toLocaleString() : null} />
                        <DetailRow label="Updated" value={applicant.updated_at ? new Date(applicant.updated_at).toLocaleString() : null} />
                    </dl>
                </div>
            </div>

            <ResumeAiAnalysisSection applicant={applicant} onRefetch={refetch} />
        </div>
    );
}

function ResumeAiAnalysisSection({
    applicant,
    onRefetch,
}: {
    applicant: Applicant;
    onRefetch: () => Promise<void>;
}) {
    const [loading, setLoading] = useState<"analyze" | "reanalyze" | null>(null);
    const [viewModal, setViewModal] = useState(false);
    const [viewData, setViewData] = useState<Awaited<ReturnType<typeof getApplicantAiAnalysis>> | null>(null);
    const [viewLoading, setViewLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const hasResume = !!(applicant.resume_path || (applicant as any).file_path);
    const hasAnalysis = applicant.ai_analysis_status === "completed" || applicant.ai_score != null;

    const handleAnalyze = async () => {
        setActionError(null);
        setLoading("analyze");
        try {
            await analyzeResume(applicant.id);
            await onRefetch();
        } catch (e) {
            setActionError(e instanceof Error ? e.message : "Analyze failed");
        } finally {
            setLoading(null);
        }
    };

    const handleReAnalyze = async () => {
        setActionError(null);
        setLoading("reanalyze");
        try {
            await reAnalyzeResume(applicant.id);
            await onRefetch();
        } catch (e) {
            setActionError(e instanceof Error ? e.message : "Re-analyze failed");
        } finally {
            setLoading(null);
        }
    };

    const handleViewAnalysis = async () => {
        setViewModal(true);
        setViewLoading(true);
        setViewData(null);
        try {
            const res = await getApplicantAiAnalysis(applicant.id);
            setViewData(res);
        } catch (e) {
            setViewData({
                status: "error",
                message: e instanceof Error ? e.message : "Failed to load analysis",
            });
        } finally {
            setViewLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume / AI analysis</h3>
                {actionError && (
                    <p className="text-sm text-red-600 mb-4">{actionError}</p>
                )}

                {(applicant.ai_score != null || applicant.ai_recommendation || applicant.ai_analysis_status || applicant.ai_analyzed_at || applicant.ai_summary) && (
                    <dl className="divide-y divide-gray-100 mb-6">
                        <DetailRow
                            label="AI Score"
                            value={applicant.ai_score != null ? `${applicant.ai_score}%` : null}
                        />
                        <DetailRow label="Recommendation" value={applicant.ai_recommendation} />
                        <DetailRow label="Analysis Status" value={applicant.ai_analysis_status} />
                        <DetailRow
                            label="Analyzed at"
                            value={applicant.ai_analyzed_at ? new Date(applicant.ai_analyzed_at).toLocaleString() : null}
                        />
                        {applicant.ai_summary?.matched_skills && applicant.ai_summary.matched_skills.length > 0 && (
                            <DetailRow
                                label="Matched Skills"
                                value={
                                    <div className="flex flex-wrap gap-2">
                                        {applicant.ai_summary.matched_skills.map((skill, idx) => (
                                            <span key={idx} className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-800">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                }
                            />
                        )}
                        {applicant.ai_summary?.missing_skills && applicant.ai_summary.missing_skills.length > 0 && (
                            <DetailRow
                                label="Missing Skills"
                                value={
                                    <div className="flex flex-wrap gap-2">
                                        {applicant.ai_summary.missing_skills.map((skill, idx) => (
                                            <span key={idx} className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-yellow-100 text-yellow-800">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                }
                            />
                        )}
                        {applicant.ai_summary?.overall_assessment && (
                            <DetailRow
                                label="Overall Assessment"
                                value={<div className="whitespace-pre-wrap">{applicant.ai_summary.overall_assessment}</div>}
                            />
                        )}
                    </dl>
                )}

                <div className="flex flex-wrap gap-2">
                    <PermissionGuard permission={PERMISSIONS.APPLICANTS.EDIT}>
                        {hasResume && (
                            <>
                                {!hasAnalysis && (
                                    <button
                                        type="button"
                                        onClick={handleAnalyze}
                                        disabled={!!loading}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
                                    >
                                        {loading === "analyze" ? "Analyzing…" : "Analyze resume"}
                                    </button>
                                )}
                                {hasAnalysis && (
                                    <button
                                        type="button"
                                        onClick={handleReAnalyze}
                                        disabled={!!loading}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium disabled:opacity-50"
                                    >
                                        {loading === "reanalyze" ? "Re-analyzing…" : "Re-analyze"}
                                    </button>
                                )}
                            </>
                        )}
                        {!hasResume && (
                            <span className="text-sm text-gray-500">No resume file to analyze.</span>
                        )}
                    </PermissionGuard>
                    <PermissionGuard permission={PERMISSIONS.APPLICANTS.VIEW}>
                        {(hasAnalysis || applicant.ai_analysis_status) && (
                            <button
                                type="button"
                                onClick={handleViewAnalysis}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
                            >
                                View AI analysis
                            </button>
                        )}
                    </PermissionGuard>
                </div>

                {viewModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setViewModal(false)}>
                        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-semibold text-gray-900">AI Analysis</h4>
                                <button type="button" onClick={() => setViewModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
                            </div>
                            {viewLoading ? (
                                <p className="text-gray-500">Loading…</p>
                            ) : viewData?.status === "processing" ? (
                                <p className="text-amber-600">{viewData.message ?? "Analysis in progress."}</p>
                            ) : viewData?.status === "error" ? (
                                <p className="text-red-600">{viewData.message}</p>
                            ) : viewData?.data ? (
                                <dl className="divide-y divide-gray-100">
                                    <DetailRow label="AI Score" value={viewData.data.ai_score != null ? `${viewData.data.ai_score}%` : null} />
                                    <DetailRow label="Recommendation" value={viewData.data.ai_recommendation} />
                                    <DetailRow label="Analyzed at" value={viewData.data.ai_analyzed_at ? new Date(viewData.data.ai_analyzed_at).toLocaleString() : null} />
                                    {viewData.data.ai_matched_skills && viewData.data.ai_matched_skills.length > 0 && (
                                        <DetailRow
                                            label="Matched skills"
                                            value={
                                                <div className="flex flex-wrap gap-2">
                                                    {viewData.data.ai_matched_skills.map((s, i) => (
                                                        <span key={i} className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-800">{s}</span>
                                                    ))}
                                                </div>
                                            }
                                        />
                                    )}
                                    {viewData.data.ai_missing_skills && viewData.data.ai_missing_skills.length > 0 && (
                                        <DetailRow
                                            label="Missing skills"
                                            value={
                                                <div className="flex flex-wrap gap-2">
                                                    {viewData.data.ai_missing_skills.map((s, i) => (
                                                        <span key={i} className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-yellow-100 text-yellow-800">{s}</span>
                                                    ))}
                                                </div>
                                            }
                                        />
                                    )}
                                    {viewData.data.ai_analysis && (
                                        <DetailRow label="Analysis" value={<div className="whitespace-pre-wrap">{viewData.data.ai_analysis}</div>} />
                                    )}
                                </dl>
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
