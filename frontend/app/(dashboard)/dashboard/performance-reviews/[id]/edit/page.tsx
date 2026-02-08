"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPerformanceReview, updatePerformanceReview } from "@/services/api/performance-reviews";
import { getEvaluationCycles } from "@/services/api/evaluation-cycles";
import { getEmployees } from "@/services/api/employees";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { PerformanceReview } from "@/lib/types/performance-review";
import type { UpdatePerformanceReviewData } from "@/services/api/performance-reviews";
import type { EvaluationCycle } from "@/lib/types/evaluation-cycle";
import type { Employee } from "@/lib/types/employee";

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
        value.length > 0 ? value.map((v, index) => ({ id: index, value: v })) : [{ id: nextId++, value: "" }]
    );
    const isInitialMount = useRef(true);
    const prevValueRef = useRef<string>(JSON.stringify(value));

    useEffect(() => {
        const currentValueStr = JSON.stringify(value);
        if (prevValueRef.current !== currentValueStr && !isInitialMount.current) {
            setItems(value.length > 0 ? value.map((v, index) => ({ id: nextId++, value: v })) : [{ id: nextId++, value: "" }]);
            prevValueRef.current = currentValueStr;
        }
        if (isInitialMount.current) {
            isInitialMount.current = false;
            prevValueRef.current = currentValueStr;
        }
    }, [value]);

    useEffect(() => {
        if (!isInitialMount.current) {
            onChange(items.map((item) => item.value).filter(Boolean));
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
                    {items.length > 1 && (
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
                    )}
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

const STATUS_OPTIONS = [
    { value: "not_started", label: "Not Started" },
    { value: "self_assessment_in_progress", label: "Self Assessment In Progress" },
    { value: "self_assessment_submitted", label: "Self Assessment Submitted" },
    { value: "manager_review_in_progress", label: "Manager Review In Progress" },
    { value: "manager_review_submitted", label: "Manager Review Submitted" },
    { value: "awaiting_acknowledgment", label: "Awaiting Acknowledgment" },
    { value: "acknowledged", label: "Acknowledged" },
    { value: "completed", label: "Completed" },
];

const OVERALL_RATING_OPTIONS = [
    { value: "exceeds", label: "Exceeds Expectations" },
    { value: "meets", label: "Meets Expectations" },
    { value: "below", label: "Below Expectations" },
];

export default function EditPerformanceReviewPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);
    const [evaluationCycles, setEvaluationCycles] = useState<EvaluationCycle[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    useEffect(() => {
        Promise.all([
            getEvaluationCycles({ perPage: 500, sortBy: "created_at", sortOrder: "desc" }),
            getEmployees({ perPage: 500, sortBy: "first_name", sortOrder: "asc" }),
        ])
            .then(([cyclesRes, employeesRes]) => {
                setEvaluationCycles(cyclesRes.data);
                setEmployees(employeesRes.data);
            })
            .catch(() => {
                setEvaluationCycles([]);
                setEmployees([]);
            })
            .finally(() => setLoadingOptions(false));
    }, []);

    const { data: performanceReview, isLoading } = useEntity<PerformanceReview>({
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
    } = useEntityForm<PerformanceReview, UpdatePerformanceReviewData, UpdatePerformanceReviewData>({
        initialData: {
            evaluation_cycle_id: undefined as unknown as number,
            employee_id: undefined as unknown as number,
            reviewer_id: null,
            status: "not_started",
            self_assessment_summary: null,
            self_assessment_achievements: [],
            self_assessment_challenges: [],
            self_assessment_goals: [],
            manager_summary: null,
            manager_strengths: [],
            manager_areas_for_improvement: [],
            manager_goals_for_next_period: [],
            manager_additional_comments: null,
            overall_rating: null,
            overall_score: null,
            promotion_recommended: false,
            salary_increase_percentage: null,
            bonus_amount: null,
            recommended_training: [],
            development_plan: [],
            employee_acknowledgment_comments: null,
        },
        entityId: id,
        updateFunction: async (entityId, data) => {
            const res = await updatePerformanceReview(entityId, {
                evaluation_cycle_id: data.evaluation_cycle_id ? Number(data.evaluation_cycle_id) : undefined,
                employee_id: data.employee_id ? Number(data.employee_id) : undefined,
                reviewer_id: data.reviewer_id ? Number(data.reviewer_id) : null,
                status: data.status || null,
                self_assessment_summary: data.self_assessment_summary || null,
                self_assessment_achievements: data.self_assessment_achievements || [],
                self_assessment_challenges: data.self_assessment_challenges || [],
                self_assessment_goals: data.self_assessment_goals || [],
                manager_summary: data.manager_summary || null,
                manager_strengths: data.manager_strengths || [],
                manager_areas_for_improvement: data.manager_areas_for_improvement || [],
                manager_goals_for_next_period: data.manager_goals_for_next_period || [],
                manager_additional_comments: data.manager_additional_comments || null,
                overall_rating: data.overall_rating || null,
                overall_score: data.overall_score ? Number(data.overall_score) : null,
                promotion_recommended: data.promotion_recommended ?? false,
                salary_increase_percentage: data.salary_increase_percentage ? Number(data.salary_increase_percentage) : null,
                bonus_amount: data.bonus_amount ? Number(data.bonus_amount) : null,
                recommended_training: data.recommended_training || [],
                development_plan: data.development_plan || [],
                employee_acknowledgment_comments: data.employee_acknowledgment_comments || null,
            });
            return res as unknown as { data: PerformanceReview };
        },
        onSuccess: () => router.push(`/dashboard/performance-reviews/${id}`),
        validate: () => {
            return null;
        },
    });

    const handleArrayChange = useCallback((
        field: "self_assessment_achievements" | "self_assessment_challenges" | "self_assessment_goals" | "manager_strengths" | "manager_areas_for_improvement" | "manager_goals_for_next_period" | "recommended_training" | "development_plan",
        value: string[]
    ) => {
        updateField(field, value);
    }, [updateField]);

    useEffect(() => {
        if (performanceReview) {
            setFormData({
                evaluation_cycle_id: performanceReview.evaluation_cycle_id ?? undefined,
                employee_id: performanceReview.employee_id ?? undefined,
                reviewer_id: performanceReview.reviewer_id ?? null,
                status: performanceReview.status ?? "not_started",
                self_assessment_summary: performanceReview.self_assessment?.summary ?? null,
                self_assessment_achievements: performanceReview.self_assessment?.achievements ?? [],
                self_assessment_challenges: performanceReview.self_assessment?.challenges ?? [],
                self_assessment_goals: performanceReview.self_assessment?.goals ?? [],
                manager_summary: performanceReview.manager_review?.summary ?? null,
                manager_strengths: performanceReview.manager_review?.strengths ?? [],
                manager_areas_for_improvement: performanceReview.manager_review?.areas_for_improvement ?? [],
                manager_goals_for_next_period: performanceReview.manager_review?.goals_for_next_period ?? [],
                manager_additional_comments: performanceReview.manager_review?.additional_comments ?? null,
                overall_rating: performanceReview.overall_rating ?? null,
                overall_score: performanceReview.overall_score ?? null,
                promotion_recommended: performanceReview.outcomes?.promotion_recommended ?? false,
                salary_increase_percentage: performanceReview.outcomes?.salary_increase_percentage ?? null,
                bonus_amount: performanceReview.outcomes?.bonus_amount ?? null,
                recommended_training: performanceReview.outcomes?.recommended_training ?? [],
                development_plan: performanceReview.outcomes?.development_plan ?? [],
                employee_acknowledgment_comments: performanceReview.acknowledgment?.comments ?? null,
            });
        }
    }, [performanceReview, setFormData]);

    if (isLoading && !performanceReview) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!performanceReview) return null;

    if (loadingOptions) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading form…</div>
            </div>
        );
    }

    const evaluationCycleOptions = evaluationCycles.map((ec) => ({ value: ec.id, label: `${ec.name} (${ec.year})` }));
    const employeeOptions = employees.map((e) => ({ value: e.id, label: `${e.first_name} ${e.last_name} (${e.work_email})` }));

    return (
        <ProtectedPage permission={PERMISSIONS.PERFORMANCE_REVIEWS.EDIT}>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit performance review</h1>
                    <p className="text-gray-600 mt-1">Performance Review #{performanceReview.id}</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    {/* Basic Information */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Evaluation Cycle"
                                name="evaluation_cycle_id"
                                type="select"
                                value={formData.evaluation_cycle_id ?? ""}
                                onChange={(e) => updateField("evaluation_cycle_id", e.target.value)}
                                options={evaluationCycleOptions}
                                disabled={isSubmitting}
                            />
                            <FormField
                                label="Status"
                                name="status"
                                type="select"
                                value={formData.status ?? "not_started"}
                                onChange={(e) => updateField("status", e.target.value)}
                                options={STATUS_OPTIONS}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <FormField
                                label="Employee"
                                name="employee_id"
                                type="select"
                                value={formData.employee_id ?? ""}
                                onChange={(e) => updateField("employee_id", e.target.value)}
                                options={employeeOptions}
                                disabled={isSubmitting}
                            />
                            <FormField
                                label="Reviewer"
                                name="reviewer_id"
                                type="select"
                                value={formData.reviewer_id ?? ""}
                                onChange={(e) => updateField("reviewer_id", e.target.value || null)}
                                options={employeeOptions}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Self Assessment Section */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Self Assessment</h2>
                        <FormField
                            label="Summary"
                            name="self_assessment_summary"
                            type="textarea"
                            value={formData.self_assessment_summary ?? ""}
                            onChange={(e) => updateField("self_assessment_summary", e.target.value || null)}
                            disabled={isSubmitting}
                            rows={4}
                            placeholder="Self-assessment summary..."
                        />
                        <div className="mt-6 space-y-6">
                            <ArrayInput
                                label="Key Achievements"
                                value={Array.isArray(formData.self_assessment_achievements) ? formData.self_assessment_achievements : []}
                                onChange={(val) => handleArrayChange("self_assessment_achievements", val)}
                                disabled={isSubmitting}
                                placeholder="e.g., Successfully completed project X"
                            />
                            <ArrayInput
                                label="Challenges Faced"
                                value={Array.isArray(formData.self_assessment_challenges) ? formData.self_assessment_challenges : []}
                                onChange={(val) => handleArrayChange("self_assessment_challenges", val)}
                                disabled={isSubmitting}
                                placeholder="e.g., Difficulty managing multiple priorities"
                            />
                            <ArrayInput
                                label="Goals for Next Period"
                                value={Array.isArray(formData.self_assessment_goals) ? formData.self_assessment_goals : []}
                                onChange={(val) => handleArrayChange("self_assessment_goals", val)}
                                disabled={isSubmitting}
                                placeholder="e.g., Improve time management skills"
                            />
                        </div>
                    </div>

                    {/* Manager Review Section */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Manager Review</h2>
                        <FormField
                            label="Summary"
                            name="manager_summary"
                            type="textarea"
                            value={formData.manager_summary ?? ""}
                            onChange={(e) => updateField("manager_summary", e.target.value || null)}
                            disabled={isSubmitting}
                            rows={4}
                            placeholder="Manager review summary..."
                        />
                        <div className="mt-6 space-y-6">
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
                        </div>
                        <div className="mt-6">
                            <FormField
                                label="Additional Comments"
                                name="manager_additional_comments"
                                type="textarea"
                                value={formData.manager_additional_comments ?? ""}
                                onChange={(e) => updateField("manager_additional_comments", e.target.value || null)}
                                disabled={isSubmitting}
                                rows={4}
                                placeholder="Any additional comments or notes..."
                            />
                        </div>
                    </div>

                    {/* Overall Rating & Outcomes */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Rating & Outcomes</h2>
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
                        <div className="mt-6">
                            <FormField
                                label="Promotion Recommended"
                                name="promotion_recommended"
                                type="checkbox"
                                checked={formData.promotion_recommended ?? false}
                                onChange={(e) => updateField("promotion_recommended", e.target.checked)}
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
                        <div className="mt-6 space-y-6">
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
                    </div>

                    {/* Acknowledgment */}
                    <div className="pb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acknowledgment</h2>
                        <FormField
                            label="Employee Acknowledgment Comments"
                            name="employee_acknowledgment_comments"
                            type="textarea"
                            value={formData.employee_acknowledgment_comments ?? ""}
                            onChange={(e) => updateField("employee_acknowledgment_comments", e.target.value || null)}
                            disabled={isSubmitting}
                            rows={4}
                            placeholder="Employee acknowledgment comments..."
                        />
                    </div>

                    <ActionButtons submitLabel="Update performance review" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
