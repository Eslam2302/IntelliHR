"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEvaluationCycle, updateEvaluationCycle } from "@/services/api/evaluation-cycles";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { EvaluationCycle } from "@/lib/types/evaluation-cycle";
import type { UpdateEvaluationCycleData } from "@/services/api/evaluation-cycles";

const TYPE_OPTIONS = [
    { value: "annual", label: "Annual" },
    { value: "semi_annual", label: "Semi-Annual" },
    { value: "quarterly", label: "Quarterly" },
    { value: "probation", label: "Probation" },
];

const PERIOD_OPTIONS = [
    { value: "H1", label: "H1 (First Half)" },
    { value: "H2", label: "H2 (Second Half)" },
    { value: "Q1", label: "Q1 (First Quarter)" },
    { value: "Q2", label: "Q2 (Second Quarter)" },
    { value: "Q3", label: "Q3 (Third Quarter)" },
    { value: "Q4", label: "Q4 (Fourth Quarter)" },
    { value: "full_year", label: "Full Year" },
];

const STATUS_OPTIONS = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "self_assessment_open", label: "Self Assessment Open" },
    { value: "manager_review_open", label: "Manager Review Open" },
    { value: "calibration", label: "Calibration" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

export default function EditEvaluationCyclePage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    const { data: evaluationCycle, isLoading } = useEntity<EvaluationCycle>({
        fetchFunction: getEvaluationCycle,
        entityId: id,
    });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<EvaluationCycle, UpdateEvaluationCycleData, UpdateEvaluationCycleData>({
        initialData: {
            name: "",
            type: "annual",
            year: new Date().getFullYear(),
            period: null,
            start_date: "",
            end_date: "",
            self_assessment_deadline: "",
            manager_review_deadline: "",
            calibration_deadline: null,
            final_review_deadline: "",
            status: "draft",
            rating_scale: null,
            include_self_assessment: true,
            include_goals: true,
            description: "",
        },
        entityId: id,
        updateFunction: async (entityId, data) => {
            const res = await updateEvaluationCycle(entityId, {
                name: data.name?.trim(),
                type: data.type,
                year: data.year ? Number(data.year) : undefined,
                period: data.period || null,
                start_date: data.start_date,
                end_date: data.end_date,
                self_assessment_deadline: data.self_assessment_deadline,
                manager_review_deadline: data.manager_review_deadline,
                calibration_deadline: data.calibration_deadline?.trim() || null,
                final_review_deadline: data.final_review_deadline,
                status: data.status || null,
                rating_scale: data.rating_scale || null,
                include_self_assessment: data.include_self_assessment,
                include_goals: data.include_goals,
                description: data.description?.trim() || null,
            });
            return res as unknown as { data: EvaluationCycle };
        },
        onSuccess: () => router.push(`/dashboard/evaluation-cycles/${id}`),
        validate: (data) => {
            if (data.name && !data.name.trim()) return "Name is required";
            return null;
        },
    });

    useEffect(() => {
        if (evaluationCycle) {
            setFormData({
                name: evaluationCycle.name ?? "",
                type: evaluationCycle.type ?? "annual",
                year: evaluationCycle.year ?? new Date().getFullYear(),
                period: evaluationCycle.period ?? null,
                start_date: evaluationCycle.dates?.start_date ?? "",
                end_date: evaluationCycle.dates?.end_date ?? "",
                self_assessment_deadline: evaluationCycle.dates?.self_assessment_deadline ?? "",
                manager_review_deadline: evaluationCycle.dates?.manager_review_deadline ?? "",
                calibration_deadline: evaluationCycle.dates?.calibration_deadline ?? null,
                final_review_deadline: evaluationCycle.dates?.final_review_deadline ?? "",
                status: evaluationCycle.status ?? "draft",
                rating_scale: evaluationCycle.rating_scale ?? null,
                include_self_assessment: evaluationCycle.include_self_assessment ?? true,
                include_goals: evaluationCycle.include_goals ?? true,
                description: evaluationCycle.description ?? "",
            });
        }
    }, [evaluationCycle, setFormData]);

    if (isLoading && !evaluationCycle) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!evaluationCycle) return null;

    return (
        <ProtectedPage permission={PERMISSIONS.EVALUATION_CYCLES.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit evaluation cycle</h1>
                    <p className="text-gray-600 mt-1">{evaluationCycle.name}</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <FormField
                        label="Name"
                        name="name"
                        type="text"
                        value={formData.name ?? ""}
                        onChange={(e) => updateField("name", e.target.value)}
                        required
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
                            label="Year"
                            name="year"
                            type="number"
                            value={formData.year ?? new Date().getFullYear()}
                            onChange={(e) => updateField("year", e.target.value)}
                            disabled={isSubmitting}
                            min={2020}
                            max={2100}
                        />
                    </div>
                    <FormField
                        label="Period"
                        name="period"
                        type="select"
                        value={formData.period ?? ""}
                        onChange={(e) => updateField("period", e.target.value || null)}
                        options={PERIOD_OPTIONS}
                        disabled={isSubmitting}
                    />
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
                            label="End date"
                            name="end_date"
                            type="date"
                            value={formData.end_date ?? ""}
                            onChange={(e) => updateField("end_date", e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Self assessment deadline"
                            name="self_assessment_deadline"
                            type="date"
                            value={formData.self_assessment_deadline ?? ""}
                            onChange={(e) => updateField("self_assessment_deadline", e.target.value)}
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Manager review deadline"
                            name="manager_review_deadline"
                            type="date"
                            value={formData.manager_review_deadline ?? ""}
                            onChange={(e) => updateField("manager_review_deadline", e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Calibration deadline"
                            name="calibration_deadline"
                            type="date"
                            value={formData.calibration_deadline ?? ""}
                            onChange={(e) => updateField("calibration_deadline", e.target.value || null)}
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Final review deadline"
                            name="final_review_deadline"
                            type="date"
                            value={formData.final_review_deadline ?? ""}
                            onChange={(e) => updateField("final_review_deadline", e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <FormField
                        label="Status"
                        name="status"
                        type="select"
                        value={formData.status ?? "draft"}
                        onChange={(e) => updateField("status", e.target.value)}
                        options={STATUS_OPTIONS}
                        disabled={isSubmitting}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Include self assessment"
                            name="include_self_assessment"
                            type="checkbox"
                            checked={formData.include_self_assessment ?? true}
                            onChange={(e) => updateField("include_self_assessment", e.target.checked)}
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Include goals"
                            name="include_goals"
                            type="checkbox"
                            checked={formData.include_goals ?? true}
                            onChange={(e) => updateField("include_goals", e.target.checked)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <FormField
                        label="Description"
                        name="description"
                        type="textarea"
                        value={formData.description ?? ""}
                        onChange={(e) => updateField("description", e.target.value)}
                        disabled={isSubmitting}
                        rows={4}
                    />
                    <ActionButtons submitLabel="Update evaluation cycle" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
