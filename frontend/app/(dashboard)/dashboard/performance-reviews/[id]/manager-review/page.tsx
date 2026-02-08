"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getPerformanceReview, startManagerReview, submitManagerReview } from "@/services/api/performance-reviews";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import { PageHeader } from "@/components/ui/PageHeader";
import type { PerformanceReview } from "@/lib/types/performance-review";
import type { SubmitManagerReviewData } from "@/services/api/performance-reviews";

interface ArrayInputItem {
    id: number;
    value: string;
}

let nextId = 0;

function ArrayInput({
    label,
    value,
    onChange,
    disabled,
    placeholder,
}: {
    label: string;
    value: string[];
    onChange: (value: string[]) => void;
    disabled: boolean;
    placeholder?: string;
}) {
    const [items, setItems] = useState<ArrayInputItem[]>(() =>
        value.map((v, index) => ({ id: index, value: v }))
    );
    const isInitialMount = useRef(true);
    const prevValueRef = useRef<string>(JSON.stringify(value));

    // Sync items when value prop changes from parent (but not on initial mount)
    useEffect(() => {
        const currentValueStr = JSON.stringify(value);
        if (prevValueRef.current !== currentValueStr && !isInitialMount.current) {
            setItems(value.map((v, index) => ({ id: index, value: v })));
            prevValueRef.current = currentValueStr;
        }
        if (isInitialMount.current) {
            isInitialMount.current = false;
            prevValueRef.current = currentValueStr;
        }
    }, [value]);

    // Call onChange when items change (but not on initial mount)
    useEffect(() => {
        if (!isInitialMount.current) {
            onChange(items.map((item) => item.value));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    const addItem = () => {
        setItems((prev) => [...prev, { id: nextId++, value: "" }]);
    };

    const updateItem = (id: number, newValue: string) => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, value: newValue } : item)));
    };

    const removeItem = (id: number) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={item.value}
                        onChange={(e) => updateItem(item.id, e.target.value)}
                        className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                        disabled={disabled}
                        placeholder={placeholder}
                        maxLength={500}
                    />
                    <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                        disabled={disabled}
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={disabled}
            >
                Add Item
            </button>
        </div>
    );
}

const OVERALL_RATING_OPTIONS = [
    { value: "exceeds", label: "Exceeds Expectations" },
    { value: "meets", label: "Meets Expectations" },
    { value: "below", label: "Below Expectations" },
];

function parseId(param: string | string[] | undefined): number | null {
    const raw = Array.isArray(param) ? param[0] : param;
    if (typeof raw !== "string" || raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
}

export default function ManagerReviewPage() {
    const params = useParams();
    const router = useRouter();
    const id = parseId(params.id);
    const [hasStarted, setHasStarted] = useState(false);

    const { data: performanceReview, isLoading, refetch } = useEntity<PerformanceReview>({
        fetchFunction: getPerformanceReview,
        entityId: id,
    });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<PerformanceReview, SubmitManagerReviewData, SubmitManagerReviewData>({
        initialData: {
            manager_summary: "",
            manager_strengths: [],
            manager_areas_for_improvement: [],
            manager_goals_for_next_period: [],
            manager_additional_comments: "",
            overall_rating: null,
            overall_score: null,
            promotion_recommended: false,
            salary_increase_percentage: null,
            bonus_amount: null,
            recommended_training: [],
            development_plan: [],
        },
        createFunction: async (data) => {
            if (!id) throw new Error("Invalid review ID");
            const res = await submitManagerReview(id, data);
            return res as unknown as { data: PerformanceReview };
        },
        onSuccess: () => {
            refetch();
            router.push(`/dashboard/performance-reviews/${id}`);
        },
        validate: (data) => {
            if (!data.manager_summary?.trim()) {
                return "Summary is required";
            }
            return null;
        },
    });

    useEffect(() => {
        if (performanceReview) {
            const managerReview = performanceReview.manager_review;
            const outcomes = performanceReview.outcomes;
            setFormData({
                manager_summary: managerReview?.summary ?? "",
                manager_strengths: managerReview?.strengths ?? [],
                manager_areas_for_improvement: managerReview?.areas_for_improvement ?? [],
                manager_goals_for_next_period: managerReview?.goals_for_next_period ?? [],
                manager_additional_comments: managerReview?.additional_comments ?? "",
                overall_rating: performanceReview.overall_rating ?? null,
                overall_score: performanceReview.overall_score ?? null,
                promotion_recommended: outcomes?.promotion_recommended ?? false,
                salary_increase_percentage: outcomes?.salary_increase_percentage ?? null,
                bonus_amount: outcomes?.bonus_amount ?? null,
                recommended_training: outcomes?.recommended_training ?? [],
                development_plan: outcomes?.development_plan ?? [],
            });

            // Auto-start if not started yet
            if (performanceReview.status === "self_assessment_submitted" && !hasStarted) {
                startManagerReview(id!).then(() => {
                    setHasStarted(true);
                    refetch();
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [performanceReview?.id, performanceReview?.status, id, hasStarted]);

    const handleArrayChange = useCallback((
        field: "manager_strengths" | "manager_areas_for_improvement" | "manager_goals_for_next_period" | "recommended_training" | "development_plan",
        value: string[]
    ) => {
        updateField(field, value);
    }, [updateField]);

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

    if (!performanceReview) return null;

    // Check if manager can edit
    if (!performanceReview.metadata?.can_manager_edit && performanceReview.status !== "manager_review_in_progress") {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">
                    {performanceReview.status === "manager_review_submitted" || performanceReview.status === "awaiting_acknowledgment"
                        ? "Manager review has already been submitted."
                        : "Manager review cannot be edited at this time."}
                </p>
                <Link href={`/dashboard/performance-reviews/${id}`} className="text-indigo-600 hover:underline">
                    Back to performance review
                </Link>
            </div>
        );
    }

    // Check if current user is the reviewer
    if (!performanceReview.metadata?.is_current_user_reviewer) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">You are not authorized to complete this manager review. Only the assigned reviewer can complete this review.</p>
                <Link href={`/dashboard/performance-reviews/${id}`} className="text-indigo-600 hover:underline">
                    Back to performance review
                </Link>
            </div>
        );
    }

    return (
        <ProtectedPage permission={PERMISSIONS.PERFORMANCE_REVIEWS.EDIT}>
            <div className="space-y-6 bg-gray-50 min-h-full">
                <PageHeader
                    title="Manager Review"
                    description={`Performance Review #${performanceReview.id} - ${performanceReview.employee ? `${performanceReview.employee.first_name} ${performanceReview.employee.last_name}` : `Employee #${performanceReview.employee_id}`}`}
                    action={
                        <Link
                            href={`/dashboard/performance-reviews/${id}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back
                        </Link>
                    }
                />

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 space-y-6">
                        <FormContainer onSubmit={handleSubmit} error={error}>
                            <FormField
                                label="Summary"
                                name="manager_summary"
                                type="textarea"
                                value={formData.manager_summary ?? ""}
                                onChange={(e) => updateField("manager_summary", e.target.value)}
                                required
                                disabled={isSubmitting}
                                rows={6}
                                placeholder="Provide a summary of the employee's performance..."
                            />

                            <ArrayInput
                                label="Strengths"
                                value={Array.isArray(formData.manager_strengths) ? formData.manager_strengths : []}
                                onChange={(val) => handleArrayChange("manager_strengths", val)}
                                disabled={isSubmitting}
                                placeholder="e.g., Excellent communication skills"
                            />

                            <ArrayInput
                                label="Areas for Improvement"
                                value={Array.isArray(formData.manager_areas_for_improvement) ? formData.manager_areas_for_improvement : []}
                                onChange={(val) => handleArrayChange("manager_areas_for_improvement", val)}
                                disabled={isSubmitting}
                                placeholder="e.g., Time management could be improved"
                            />

                            <ArrayInput
                                label="Goals for Next Period"
                                value={Array.isArray(formData.manager_goals_for_next_period) ? formData.manager_goals_for_next_period : []}
                                onChange={(val) => handleArrayChange("manager_goals_for_next_period", val)}
                                disabled={isSubmitting}
                                placeholder="e.g., Complete advanced training in X"
                            />

                            <FormField
                                label="Additional Comments"
                                name="manager_additional_comments"
                                type="textarea"
                                value={formData.manager_additional_comments ?? ""}
                                onChange={(e) => updateField("manager_additional_comments", e.target.value)}
                                disabled={isSubmitting}
                                rows={4}
                                placeholder="Any additional comments or notes..."
                            />

                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Rating & Outcomes</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        label="Overall Rating"
                                        name="overall_rating"
                                        type="select"
                                        value={formData.overall_rating ?? ""}
                                        onChange={(e) => updateField("overall_rating", e.target.value || null)}
                                        options={OVERALL_RATING_OPTIONS}
                                        disabled={isSubmitting}
                                    />
                                    <FormField
                                        label="Overall Score"
                                        name="overall_score"
                                        type="number"
                                        value={formData.overall_score ?? ""}
                                        onChange={(e) => updateField("overall_score", e.target.value ? Number(e.target.value) : null)}
                                        disabled={isSubmitting}
                                        min={0}
                                        max={5}
                                        step={0.1}
                                    />
                                </div>

                                <FormField
                                    label="Promotion Recommended"
                                    name="promotion_recommended"
                                    type="checkbox"
                                    checked={formData.promotion_recommended ?? false}
                                    onChange={(e) => updateField("promotion_recommended", e.target.checked)}
                                    disabled={isSubmitting}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        label="Salary Increase Percentage"
                                        name="salary_increase_percentage"
                                        type="number"
                                        value={formData.salary_increase_percentage ?? ""}
                                        onChange={(e) => updateField("salary_increase_percentage", e.target.value ? Number(e.target.value) : null)}
                                        disabled={isSubmitting}
                                        min={0}
                                        max={100}
                                        step={0.01}
                                    />
                                    <FormField
                                        label="Bonus Amount"
                                        name="bonus_amount"
                                        type="number"
                                        value={formData.bonus_amount ?? ""}
                                        onChange={(e) => updateField("bonus_amount", e.target.value ? Number(e.target.value) : null)}
                                        disabled={isSubmitting}
                                        min={0}
                                        step={0.01}
                                    />
                                </div>

                                <ArrayInput
                                    label="Recommended Training"
                                    value={Array.isArray(formData.recommended_training) ? formData.recommended_training : []}
                                    onChange={(val) => handleArrayChange("recommended_training", val)}
                                    disabled={isSubmitting}
                                    placeholder="e.g., Leadership Development Program"
                                />

                                <ArrayInput
                                    label="Development Plan"
                                    value={Array.isArray(formData.development_plan) ? formData.development_plan : []}
                                    onChange={(val) => handleArrayChange("development_plan", val)}
                                    disabled={isSubmitting}
                                    placeholder="e.g., Focus on improving presentation skills"
                                />
                            </div>

                            <ActionButtons
                                submitLabel="Submit Manager Review"
                                isSubmitting={isSubmitting}
                                cancelHref={`/dashboard/performance-reviews/${id}`}
                            />
                        </FormContainer>
                    </div>
                </div>
            </div>
        </ProtectedPage>
    );
}
