"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEntity } from "@/hooks/useEntity";
import { getPerformanceReview, completeReview } from "@/services/api/performance-reviews";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";
import type { PerformanceReview } from "@/lib/types/performance-review";

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
        self_assessment_in_progress: { bg: "bg-yellow-100", text: "text-yellow-800" },
        self_assessment_submitted: { bg: "bg-blue-100", text: "text-blue-800" },
        manager_review_in_progress: { bg: "bg-orange-100", text: "text-orange-800" },
        manager_review_submitted: { bg: "bg-purple-100", text: "text-purple-800" },
        awaiting_acknowledgment: { bg: "bg-indigo-100", text: "text-indigo-800" },
        acknowledged: { bg: "bg-green-100", text: "text-green-800" },
        completed: { bg: "bg-green-100", text: "text-green-800" },
    };
    const s = map[status] ?? { bg: "bg-gray-100", text: "text-gray-800" };
    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${s.bg} ${s.text}`}>
            {status.replace(/_/g, " ")}
        </span>
    );
}

export default function PerformanceReviewViewPage() {
    const params = useParams();
    const router = useRouter();
    const id = parseId(params.id);
    const [isCompleting, setIsCompleting] = useState(false);
    const { data: performanceReview, isLoading, error, refetch } = useEntity<PerformanceReview>({
        fetchFunction: getPerformanceReview,
        entityId: id,
    });

    const handleComplete = async () => {
        if (!id || !performanceReview?.metadata?.can_complete) return;
        
        if (!confirm("Are you sure you want to mark this review as completed? This action cannot be undone.")) {
            return;
        }

        try {
            setIsCompleting(true);
            await completeReview(id);
            await refetch();
            router.refresh();
        } catch (err) {
            console.error("Error completing review:", err);
            alert("Failed to complete review. Please try again.");
        } finally {
            setIsCompleting(false);
        }
    };

    if (id === null) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Invalid performance review ID</p>
                <Link href="/dashboard/performance-reviews" className="text-indigo-600 hover:underline">
                    Back to performance reviews
                </Link>
            </div>
        );
    }

    if (isLoading && !performanceReview) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (error && !performanceReview) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/dashboard/performance-reviews" className="text-indigo-600 hover:underline">
                    Back to performance reviews
                </Link>
            </div>
        );
    }

    if (!performanceReview) return null;

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title={`Performance Review #${performanceReview.id}`}
                description="Performance review details"
                action={
                    <div className="flex items-center gap-3">
                        {performanceReview.metadata?.can_employee_edit && performanceReview.metadata?.is_current_user_employee && (
                            <Link
                                href={`/dashboard/performance-reviews/${performanceReview.id}/self-assessment`}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Complete Self-Assessment
                            </Link>
                        )}
                        {performanceReview.metadata?.can_manager_edit && performanceReview.metadata?.is_current_user_reviewer && (
                            <Link
                                href={`/dashboard/performance-reviews/${performanceReview.id}/manager-review`}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Complete Manager Review
                            </Link>
                        )}
                        {performanceReview.metadata?.can_employee_acknowledge && performanceReview.metadata?.is_current_user_employee && (
                            <Link
                                href={`/dashboard/performance-reviews/${performanceReview.id}/acknowledge`}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Acknowledge Review
                            </Link>
                        )}
                        {performanceReview.metadata?.can_complete && (
                            <PermissionGuard permission={PERMISSIONS.PERFORMANCE_REVIEWS.EDIT}>
                                <button
                                    onClick={handleComplete}
                                    disabled={isCompleting}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {isCompleting ? "Completing..." : "Complete Review"}
                                </button>
                            </PermissionGuard>
                        )}
                        <PermissionGuard permission={PERMISSIONS.PERFORMANCE_REVIEWS.EDIT}>
                            <Link
                                href={`/dashboard/performance-reviews/${performanceReview.id}/edit`}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </Link>
                        </PermissionGuard>
                    </div>
                }
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                    <dl className="divide-y divide-gray-100">
                        <DetailRow
                            label="Employee"
                            value={
                                performanceReview.employee ? (
                                    <Link href={`/dashboard/employees/${performanceReview.employee.id}`} className="text-indigo-600 hover:underline">
                                        {getEmployeeDisplayLabel(performanceReview.employee, performanceReview.employee.id)}
                                    </Link>
                                ) : performanceReview.employee_id ? (
                                    `Employee #${performanceReview.employee_id}`
                                ) : null
                            }
                        />
                        <DetailRow
                            label="Reviewer"
                            value={
                                performanceReview.reviewer ? (
                                    <Link href={`/dashboard/employees/${performanceReview.reviewer.id}`} className="text-indigo-600 hover:underline">
                                        {getEmployeeDisplayLabel(performanceReview.reviewer, performanceReview.reviewer.id)}
                                    </Link>
                                ) : performanceReview.reviewer_id ? (
                                    `Employee #${performanceReview.reviewer_id}`
                                ) : null
                            }
                        />
                        <DetailRow
                            label="Evaluation Cycle"
                            value={
                                performanceReview.evaluation_cycle ? (
                                    <Link href={`/dashboard/evaluation-cycles/${performanceReview.evaluation_cycle.id}`} className="text-indigo-600 hover:underline">
                                        {performanceReview.evaluation_cycle.name}
                                    </Link>
                                ) : performanceReview.evaluation_cycle_id ? (
                                    `Cycle #${performanceReview.evaluation_cycle_id}`
                                ) : null
                            }
                        />
                        <DetailRow label="Status" value={statusBadge(performanceReview.status)} />
                        <DetailRow label="Overall Rating" value={performanceReview.overall_rating_label ?? performanceReview.overall_rating ?? "—"} />
                        <DetailRow label="Overall Score" value={performanceReview.overall_score ?? "—"} />
                    </dl>
                </div>
            </div>

            {/* Self Assessment Section */}
            {performanceReview.self_assessment && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Self Assessment</h2>
                        <dl className="divide-y divide-gray-100">
                            <DetailRow
                                label="Summary"
                                value={performanceReview.self_assessment.summary ? <div className="whitespace-pre-wrap">{performanceReview.self_assessment.summary}</div> : null}
                            />
                            {performanceReview.self_assessment.achievements && performanceReview.self_assessment.achievements.length > 0 && (
                                <DetailRow
                                    label="Key Achievements"
                                    value={
                                        <ul className="list-disc list-inside space-y-1">
                                            {performanceReview.self_assessment.achievements.map((achievement, idx) => (
                                                <li key={idx} className="text-sm text-gray-700">{achievement}</li>
                                            ))}
                                        </ul>
                                    }
                                />
                            )}
                            {performanceReview.self_assessment.challenges && performanceReview.self_assessment.challenges.length > 0 && (
                                <DetailRow
                                    label="Challenges Faced"
                                    value={
                                        <ul className="list-disc list-inside space-y-1">
                                            {performanceReview.self_assessment.challenges.map((challenge, idx) => (
                                                <li key={idx} className="text-sm text-gray-700">{challenge}</li>
                                            ))}
                                        </ul>
                                    }
                                />
                            )}
                            {performanceReview.self_assessment.goals && performanceReview.self_assessment.goals.length > 0 && (
                                <DetailRow
                                    label="Goals for Next Period"
                                    value={
                                        <ul className="list-disc list-inside space-y-1">
                                            {performanceReview.self_assessment.goals.map((goal, idx) => (
                                                <li key={idx} className="text-sm text-gray-700">{goal}</li>
                                            ))}
                                        </ul>
                                    }
                                />
                            )}
                            <DetailRow
                                label="Submitted At"
                                value={performanceReview.self_assessment.submitted_at ? new Date(performanceReview.self_assessment.submitted_at).toLocaleString() : null}
                            />
                        </dl>
                    </div>
                </div>
            )}

            {/* Manager Review Section */}
            {performanceReview.manager_review && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Manager Review</h2>
                        <dl className="divide-y divide-gray-100">
                            <DetailRow
                                label="Summary"
                                value={performanceReview.manager_review.summary ? <div className="whitespace-pre-wrap">{performanceReview.manager_review.summary}</div> : null}
                            />
                            {performanceReview.manager_review.strengths && performanceReview.manager_review.strengths.length > 0 && (
                                <DetailRow
                                    label="Strengths"
                                    value={
                                        <ul className="list-disc list-inside space-y-1">
                                            {performanceReview.manager_review.strengths.map((strength, idx) => (
                                                <li key={idx} className="text-sm text-gray-700">{strength}</li>
                                            ))}
                                        </ul>
                                    }
                                />
                            )}
                            {performanceReview.manager_review.areas_for_improvement && performanceReview.manager_review.areas_for_improvement.length > 0 && (
                                <DetailRow
                                    label="Areas for Improvement"
                                    value={
                                        <ul className="list-disc list-inside space-y-1">
                                            {performanceReview.manager_review.areas_for_improvement.map((area, idx) => (
                                                <li key={idx} className="text-sm text-gray-700">{area}</li>
                                            ))}
                                        </ul>
                                    }
                                />
                            )}
                            {performanceReview.manager_review.goals_for_next_period && performanceReview.manager_review.goals_for_next_period.length > 0 && (
                                <DetailRow
                                    label="Goals for Next Period"
                                    value={
                                        <ul className="list-disc list-inside space-y-1">
                                            {performanceReview.manager_review.goals_for_next_period.map((goal, idx) => (
                                                <li key={idx} className="text-sm text-gray-700">{goal}</li>
                                            ))}
                                        </ul>
                                    }
                                />
                            )}
                            {performanceReview.manager_review.additional_comments && (
                                <DetailRow
                                    label="Additional Comments"
                                    value={<div className="whitespace-pre-wrap">{performanceReview.manager_review.additional_comments}</div>}
                                />
                            )}
                            <DetailRow
                                label="Submitted At"
                                value={performanceReview.manager_review.submitted_at ? new Date(performanceReview.manager_review.submitted_at).toLocaleString() : null}
                            />
                        </dl>
                    </div>
                </div>
            )}

            {/* Review Ratings Section */}
            {performanceReview.ratings && performanceReview.ratings.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Competency Ratings</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competency</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Self Rating</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Manager Rating</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Gap</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {performanceReview.ratings.map((rating) => (
                                        <tr key={rating.id}>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {rating.competency ? (
                                                    <Link href={`/dashboard/competencies/${rating.competency.id}`} className="text-indigo-600 hover:underline font-medium">
                                                        {rating.competency.name}
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-600">Competency #{rating.competency_id}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                {rating.self_rating ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {rating.self_rating}/5
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                {rating.manager_rating ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {rating.manager_rating}/5
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                                {rating.rating_gap !== null && rating.rating_gap !== undefined ? (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        rating.rating_gap > 0 ? 'bg-yellow-100 text-yellow-800' :
                                                        rating.rating_gap < 0 ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {rating.rating_gap > 0 ? '+' : ''}{rating.rating_gap}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Outcomes Section */}
            {performanceReview.outcomes && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Outcomes & Recommendations</h2>
                        <dl className="divide-y divide-gray-100">
                            <DetailRow
                                label="Promotion Recommended"
                                value={performanceReview.outcomes.promotion_recommended ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Yes
                                    </span>
                                ) : (
                                    <span className="text-gray-500">No</span>
                                )}
                            />
                            {performanceReview.outcomes.salary_increase_percentage && (
                                <DetailRow label="Salary Increase Percentage" value={`${performanceReview.outcomes.salary_increase_percentage}%`} />
                            )}
                            {performanceReview.outcomes.bonus_amount && (
                                <DetailRow label="Bonus Amount" value={`$${performanceReview.outcomes.bonus_amount.toLocaleString()}`} />
                            )}
                            {performanceReview.outcomes.recommended_training && performanceReview.outcomes.recommended_training.length > 0 && (
                                <DetailRow
                                    label="Recommended Training"
                                    value={
                                        <ul className="list-disc list-inside space-y-1">
                                            {performanceReview.outcomes.recommended_training.map((training, idx) => (
                                                <li key={idx} className="text-sm text-gray-700">{training}</li>
                                            ))}
                                        </ul>
                                    }
                                />
                            )}
                            {performanceReview.outcomes.development_plan && performanceReview.outcomes.development_plan.length > 0 && (
                                <DetailRow
                                    label="Development Plan"
                                    value={
                                        <ul className="list-disc list-inside space-y-1">
                                            {performanceReview.outcomes.development_plan.map((item, idx) => (
                                                <li key={idx} className="text-sm text-gray-700">{item}</li>
                                            ))}
                                        </ul>
                                    }
                                />
                            )}
                        </dl>
                    </div>
                </div>
            )}

            {/* Acknowledgment Section */}
            {performanceReview.acknowledgment && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acknowledgment</h2>
                        <dl className="divide-y divide-gray-100">
                            <DetailRow
                                label="Acknowledged At"
                                value={performanceReview.acknowledgment.acknowledged_at ? new Date(performanceReview.acknowledgment.acknowledged_at).toLocaleString() : null}
                            />
                            {performanceReview.acknowledgment.comments && (
                                <DetailRow
                                    label="Acknowledgment Comments"
                                    value={<div className="whitespace-pre-wrap">{performanceReview.acknowledgment.comments}</div>}
                                />
                            )}
                        </dl>
                    </div>
                </div>
            )}

            {/* Metadata Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
                    <dl className="divide-y divide-gray-100">
                        <DetailRow label="Created" value={performanceReview.created_at ? new Date(performanceReview.created_at).toLocaleString() : null} />
                        <DetailRow label="Updated" value={performanceReview.updated_at ? new Date(performanceReview.updated_at).toLocaleString() : null} />
                        {performanceReview.completed_at && (
                            <DetailRow label="Completed At" value={new Date(performanceReview.completed_at).toLocaleString()} />
                        )}
                        {performanceReview.metadata?.is_overdue && (
                            <DetailRow
                                label="Status"
                                value={<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Overdue</span>}
                            />
                        )}
                        {performanceReview.metadata?.days_until_deadline !== null && performanceReview.metadata?.days_until_deadline !== undefined && (
                            <DetailRow
                                label="Days Until Deadline"
                                value={
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        performanceReview.metadata.days_until_deadline < 0 ? 'bg-red-100 text-red-800' :
                                        performanceReview.metadata.days_until_deadline <= 3 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {performanceReview.metadata.days_until_deadline < 0 ? `${Math.abs(performanceReview.metadata.days_until_deadline)} days overdue` :
                                         performanceReview.metadata.days_until_deadline === 0 ? 'Due today' :
                                         `${performanceReview.metadata.days_until_deadline} days remaining`}
                                    </span>
                                }
                            />
                        )}
                    </dl>
                </div>
            </div>
        </div>
    );
}
