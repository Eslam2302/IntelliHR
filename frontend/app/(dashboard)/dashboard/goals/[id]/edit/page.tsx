"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getGoal, updateGoal } from "@/services/api/goals";
import { getEmployees } from "@/services/api/employees";
import { getEvaluationCycles } from "@/services/api/evaluation-cycles";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Goal } from "@/lib/types/goal";
import type { UpdateGoalData } from "@/services/api/goals";
import type { Employee } from "@/lib/types/employee";
import type { EvaluationCycle } from "@/lib/types/evaluation-cycle";

function SuccessCriteriaInput({ value, onChange, disabled }: { value: string[]; onChange: (value: string[]) => void; disabled?: boolean }) {
    const [criteria, setCriteria] = useState<string[]>(value.length > 0 ? value : [""]);

    useEffect(() => {
        if (value.length > 0) {
            setCriteria(value);
        } else if (criteria.length === 0) {
            setCriteria([""]);
        }
    }, [value]);

    const addCriterion = () => {
        setCriteria([...criteria, ""]);
    };

    const removeCriterion = (index: number) => {
        const newCriteria = criteria.filter((_, i) => i !== index);
        setCriteria(newCriteria.length > 0 ? newCriteria : [""]);
        onChange(newCriteria.filter(c => c.trim()));
    };

    const updateCriterion = (index: number, text: string) => {
        const newCriteria = [...criteria];
        newCriteria[index] = text;
        setCriteria(newCriteria);
        onChange(newCriteria.filter(c => c.trim()));
    };

    return (
        <div className="space-y-2">
            {criteria.map((criterion, index) => (
                <div key={index} className="flex gap-2">
                    <input
                        type="text"
                        value={criterion}
                        onChange={(e) => updateCriterion(index, e.target.value)}
                        disabled={disabled}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                        placeholder={`Criterion ${index + 1}`}
                    />
                    {criteria.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeCriterion(index)}
                            disabled={disabled}
                            className="px-3 py-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            ))}
            <button
                type="button"
                onClick={addCriterion}
                disabled={disabled}
                className="text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
            >
                + Add criterion
            </button>
        </div>
    );
}

const TYPE_OPTIONS = [
    { value: "individual", label: "Individual" },
    { value: "team", label: "Team" },
    { value: "departmental", label: "Departmental" },
    { value: "company", label: "Company" },
];

const CATEGORY_OPTIONS = [
    { value: "performance", label: "Performance" },
    { value: "development", label: "Development" },
    { value: "behavioral", label: "Behavioral" },
];

const STATUS_OPTIONS = [
    { value: "not_started", label: "Not Started" },
    { value: "in_progress", label: "In Progress" },
    { value: "at_risk", label: "At Risk" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

export default function EditGoalPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [evaluationCycles, setEvaluationCycles] = useState<EvaluationCycle[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    useEffect(() => {
        Promise.all([
            getEmployees({ perPage: 500, sortBy: "first_name", sortOrder: "asc" }),
            getEvaluationCycles({ perPage: 500, sortBy: "created_at", sortOrder: "desc" }),
        ])
            .then(([employeesRes, cyclesRes]) => {
                setEmployees(employeesRes.data);
                setEvaluationCycles(cyclesRes.data);
            })
            .catch(() => {
                setEmployees([]);
                setEvaluationCycles([]);
            })
            .finally(() => setLoadingOptions(false));
    }, []);

    const { data: goal, isLoading } = useEntity<Goal>({
        fetchFunction: getGoal,
        entityId: id,
    });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<Goal, UpdateGoalData, UpdateGoalData>({
        initialData: {
            employee_id: undefined as unknown as number,
            evaluation_cycle_id: null,
            set_by: undefined as unknown as number,
            title: "",
            description: "",
            type: "individual",
            category: "performance",
            success_criteria: null,
            start_date: "",
            target_date: "",
            weight: null,
            status: "not_started",
            progress_percentage: 0,
        },
        entityId: id,
        updateFunction: async (entityId, data) => {
            // Ensure success_criteria is an array if provided
            let successCriteria: string[] | undefined = undefined;
            if (data.success_criteria !== undefined && data.success_criteria !== null) {
                if (Array.isArray(data.success_criteria)) {
                    successCriteria = data.success_criteria.filter(c => c?.trim());
                } else if (typeof data.success_criteria === 'string') {
                    try {
                        const parsed = JSON.parse(data.success_criteria);
                        if (Array.isArray(parsed)) {
                            successCriteria = parsed.filter(c => c?.trim());
                        }
                    } catch {
                        if (data.success_criteria.trim()) {
                            successCriteria = [data.success_criteria.trim()];
                        }
                    }
                }
            }
            
            const res = await updateGoal(entityId, {
                employee_id: data.employee_id ? Number(data.employee_id) : undefined,
                evaluation_cycle_id: data.evaluation_cycle_id ? Number(data.evaluation_cycle_id) : null,
                set_by: data.set_by ? Number(data.set_by) : undefined,
                title: data.title?.trim(),
                description: data.description?.trim(),
                type: data.type,
                category: data.category,
                success_criteria: successCriteria,
                start_date: data.start_date,
                target_date: data.target_date,
                weight: data.weight ? Number(data.weight) : undefined,
                status: data.status,
                progress_percentage: data.progress_percentage ? Number(data.progress_percentage) : undefined,
            });
            return res as unknown as { data: Goal };
        },
        onSuccess: () => router.push(`/dashboard/goals/${id}`),
        validate: (data) => {
            if (data.title && !data.title.trim()) return "Title is required";
            return null;
        },
    });

    useEffect(() => {
        if (goal) {
            // Handle success_criteria - it can be array or object
            let successCriteria: string[] = [];
            if (goal.success_criteria) {
                if (Array.isArray(goal.success_criteria)) {
                    successCriteria = goal.success_criteria;
                } else if (typeof goal.success_criteria === 'object') {
                    // If it's an object with criterion/target structure, extract just the criterion strings
                    successCriteria = Object.values(goal.success_criteria).map((c) => {
                        if (typeof c === 'string') {
                            return c;
                        }
                        const item = c as { criterion?: string; target?: string } | string;
                        if (typeof item === 'object' && item !== null) {
                            return item.criterion || item.target || String(item);
                        }
                        return String(c);
                    }).filter(Boolean) as string[];
                }
            }
            
            setFormData({
                employee_id: goal.employee_id ?? undefined,
                evaluation_cycle_id: goal.evaluation_cycle_id ?? null,
                set_by: goal.set_by?.id ?? undefined,
                title: goal.title ?? "",
                description: goal.description ?? "",
                type: goal.type ?? "individual",
                category: goal.category ?? "performance",
                success_criteria: successCriteria.length > 0 ? successCriteria : [],
                start_date: goal.dates?.start_date ?? goal.start_date ?? "",
                target_date: goal.dates?.target_date ?? goal.target_date ?? "",
                weight: goal.weight ?? 1,
                status: goal.status ?? "not_started",
                progress_percentage: goal.progress_percentage ?? 0,
            });
        }
    }, [goal, setFormData]);

    if (isLoading && !goal) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!goal) return null;

    if (loadingOptions) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading form…</div>
            </div>
        );
    }

    const employeeOptions = employees.map((e) => ({ value: e.id, label: `${e.first_name} ${e.last_name} (${e.work_email})` }));
    const evaluationCycleOptions = evaluationCycles.map((ec) => ({ value: ec.id, label: `${ec.name} (${ec.year})` }));

    return (
        <ProtectedPage permission={PERMISSIONS.GOALS.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit goal</h1>
                    <p className="text-gray-600 mt-1">{goal.title}</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <FormField
                        label="Title"
                        name="title"
                        type="text"
                        value={formData.title ?? ""}
                        onChange={(e) => updateField("title", e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Description"
                        name="description"
                        type="textarea"
                        value={formData.description ?? ""}
                        onChange={(e) => updateField("description", e.target.value)}
                        disabled={isSubmitting}
                        rows={4}
                    />
                    <FormField
                        label="Employee"
                        name="employee_id"
                        type="select"
                        value={formData.employee_id ?? ""}
                        onChange={(e) => updateField("employee_id", e.target.value)}
                        options={employeeOptions}
                        disabled={isSubmitting}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Type"
                            name="type"
                            type="select"
                            value={formData.type ?? ""}
                            onChange={(e) => updateField("type", e.target.value)}
                            options={TYPE_OPTIONS}
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Category"
                            name="category"
                            type="select"
                            value={formData.category ?? ""}
                            onChange={(e) => updateField("category", e.target.value)}
                            options={CATEGORY_OPTIONS}
                            disabled={isSubmitting}
                        />
                    </div>
                    <FormField
                        label="Evaluation Cycle"
                        name="evaluation_cycle_id"
                        type="select"
                        value={formData.evaluation_cycle_id ?? ""}
                        onChange={(e) => updateField("evaluation_cycle_id", e.target.value || null)}
                        options={evaluationCycleOptions}
                        disabled={isSubmitting}
                    />
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Success Criteria
                        </label>
                        <p className="text-xs text-gray-500 mb-3">Add at least one measurable success criterion</p>
                        <SuccessCriteriaInput
                            value={Array.isArray(formData.success_criteria) ? formData.success_criteria : []}
                            onChange={(criteria) => updateField("success_criteria", criteria)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Start date"
                            name="start_date"
                            type="date"
                            value={formData.start_date ?? ""}
                            onChange={(e) => updateField("start_date", e.target.value)}
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Target date"
                            name="target_date"
                            type="date"
                            value={formData.target_date ?? ""}
                            onChange={(e) => updateField("target_date", e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Weight"
                            name="weight"
                            type="number"
                            value={formData.weight ?? 1}
                            onChange={(e) => updateField("weight", e.target.value)}
                            disabled={isSubmitting}
                            min={1}
                            max={10}
                        />
                        <FormField
                            label="Progress Percentage"
                            name="progress_percentage"
                            type="number"
                            value={formData.progress_percentage ?? 0}
                            onChange={(e) => updateField("progress_percentage", e.target.value)}
                            disabled={isSubmitting}
                            min={0}
                            max={100}
                        />
                    </div>
                    <FormField
                        label="Status"
                        name="status"
                        type="select"
                        value={formData.status ?? "not_started"}
                        onChange={(e) => updateField("status", e.target.value)}
                        options={STATUS_OPTIONS}
                        disabled={isSubmitting}
                    />
                    <ActionButtons submitLabel="Update goal" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
