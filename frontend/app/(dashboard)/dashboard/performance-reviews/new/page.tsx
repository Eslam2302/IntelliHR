"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPerformanceReview } from "@/services/api/performance-reviews";
import { getEvaluationCycles } from "@/services/api/evaluation-cycles";
import { getEmployees } from "@/services/api/employees";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { PerformanceReview } from "@/lib/types/performance-review";
import type { CreatePerformanceReviewData } from "@/services/api/performance-reviews";
import type { EvaluationCycle } from "@/lib/types/evaluation-cycle";
import type { Employee } from "@/lib/types/employee";

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

export default function NewPerformanceReviewPage() {
    const router = useRouter();
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

    const {
        formData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<PerformanceReview, CreatePerformanceReviewData, CreatePerformanceReviewData>({
        initialData: {
            evaluation_cycle_id: undefined as unknown as number,
            employee_id: undefined as unknown as number,
            reviewer_id: null,
            status: "not_started",
        },
        createFunction: async (data) => {
            const res = await createPerformanceReview({
                evaluation_cycle_id: Number(data.evaluation_cycle_id)!,
                employee_id: Number(data.employee_id)!,
                reviewer_id: data.reviewer_id ? Number(data.reviewer_id) : null,
                status: data.status || "not_started",
            });
            return res as unknown as { data: PerformanceReview };
        },
        onSuccess: () => router.push("/dashboard/performance-reviews"),
        validate: (data) => {
            if (!data.evaluation_cycle_id) return "Evaluation cycle is required";
            if (!data.employee_id) return "Employee is required";
            return null;
        },
    });

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
        <ProtectedPage permission={PERMISSIONS.PERFORMANCE_REVIEWS.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create performance review</h1>
                    <p className="text-gray-600 mt-1">Add a new performance review</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <FormField
                        label="Evaluation Cycle"
                        name="evaluation_cycle_id"
                        type="select"
                        value={formData.evaluation_cycle_id ?? ""}
                        onChange={(e) => updateField("evaluation_cycle_id", e.target.value)}
                        options={evaluationCycleOptions}
                        required
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Employee"
                        name="employee_id"
                        type="select"
                        value={formData.employee_id ?? ""}
                        onChange={(e) => updateField("employee_id", e.target.value)}
                        options={employeeOptions}
                        required
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
                    <FormField
                        label="Status"
                        name="status"
                        type="select"
                        value={formData.status ?? "not_started"}
                        onChange={(e) => updateField("status", e.target.value)}
                        options={STATUS_OPTIONS}
                        disabled={isSubmitting}
                    />
                    <ActionButtons submitLabel="Create performance review" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
