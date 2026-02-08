"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getPerformanceReview, startSelfAssessment, submitSelfAssessment } from "@/services/api/performance-reviews";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import { PageHeader } from "@/components/ui/PageHeader";
import type { PerformanceReview } from "@/lib/types/performance-review";
import type { SubmitSelfAssessmentData } from "@/services/api/performance-reviews";

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

function parseId(param: string | string[] | undefined): number | null {
    const raw = Array.isArray(param) ? param[0] : param;
    if (typeof raw !== "string" || raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
}

export default function SelfAssessmentPage() {
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
    } = useEntityForm<PerformanceReview, SubmitSelfAssessmentData, SubmitSelfAssessmentData>({
        initialData: {
            self_assessment_summary: "",
            self_assessment_achievements: [],
            self_assessment_challenges: [],
            self_assessment_goals: [],
        },
        createFunction: async (data) => {
            if (!id) throw new Error("Invalid review ID");
            const res = await submitSelfAssessment(id, data);
            return res as unknown as { data: PerformanceReview };
        },
        onSuccess: () => {
            refetch();
            router.push(`/dashboard/performance-reviews/${id}`);
        },
        validate: (data) => {
            if (!data.self_assessment_summary?.trim()) {
                return "Summary is required";
            }
            return null;
        },
    });

    useEffect(() => {
        if (performanceReview) {
            const selfAssessment = performanceReview.self_assessment;
            setFormData({
                self_assessment_summary: selfAssessment?.summary ?? "",
                self_assessment_achievements: selfAssessment?.achievements ?? [],
                self_assessment_challenges: selfAssessment?.challenges ?? [],
                self_assessment_goals: selfAssessment?.goals ?? [],
            });

            // Auto-start if not started yet
            if (performanceReview.status === "not_started" && !hasStarted) {
                startSelfAssessment(id!).then(() => {
                    setHasStarted(true);
                    refetch();
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [performanceReview?.id, performanceReview?.status, id, hasStarted]);

    const handleArrayChange = useCallback((field: "self_assessment_achievements" | "self_assessment_challenges" | "self_assessment_goals", value: string[]) => {
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

    // Check if employee can edit
    if (!performanceReview.metadata?.can_employee_edit && performanceReview.status !== "self_assessment_in_progress") {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">
                    {performanceReview.status === "self_assessment_submitted"
                        ? "Self-assessment has already been submitted."
                        : "Self-assessment cannot be edited at this time."}
                </p>
                <Link href={`/dashboard/performance-reviews/${id}`} className="text-indigo-600 hover:underline">
                    Back to performance review
                </Link>
            </div>
        );
    }

    // Check if current user is the employee
    if (!performanceReview.metadata?.is_current_user_employee) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">You are not authorized to complete this self-assessment. Only the employee being reviewed can complete this assessment.</p>
                <Link href={`/dashboard/performance-reviews/${id}`} className="text-indigo-600 hover:underline">
                    Back to performance review
                </Link>
            </div>
        );
    }

    return (
        <ProtectedPage permission={PERMISSIONS.PERFORMANCE_REVIEWS.VIEW_ALL}>
            <div className="space-y-6 bg-gray-50 min-h-full">
                <PageHeader
                    title="Self-Assessment"
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
                    <div className="p-6">
                        <FormContainer onSubmit={handleSubmit} error={error}>
                            <FormField
                                label="Summary"
                                name="self_assessment_summary"
                                type="textarea"
                                value={formData.self_assessment_summary ?? ""}
                                onChange={(e) => updateField("self_assessment_summary", e.target.value)}
                                required
                                disabled={isSubmitting}
                                rows={6}
                                placeholder="Provide a summary of your performance, achievements, and areas for growth..."
                            />

                            <ArrayInput
                                label="Key Achievements"
                                value={Array.isArray(formData.self_assessment_achievements) ? formData.self_assessment_achievements : []}
                                onChange={(val) => handleArrayChange("self_assessment_achievements", val)}
                                disabled={isSubmitting}
                                placeholder="e.g., Successfully completed project X ahead of schedule"
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

                            <ActionButtons
                                submitLabel="Submit Self-Assessment"
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
