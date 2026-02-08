"use client";

import { useRouter } from "next/navigation";
import { createEvaluationCycle } from "@/services/api/evaluation-cycles";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { EvaluationCycle } from "@/lib/types/evaluation-cycle";
import type { CreateEvaluationCycleData } from "@/services/api/evaluation-cycles";

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

const currentYear = new Date().getFullYear();

export default function NewEvaluationCyclePage() {
    const router = useRouter();

    const {
        formData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<EvaluationCycle, CreateEvaluationCycleData, CreateEvaluationCycleData>({
        initialData: {
            name: "",
            type: "annual",
            year: currentYear,
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
        createFunction: async (data) => {
            const res = await createEvaluationCycle({
                name: data.name!.trim(),
                type: data.type!,
                year: Number(data.year)!,
                period: data.period || null,
                start_date: data.start_date!,
                end_date: data.end_date!,
                self_assessment_deadline: data.self_assessment_deadline!,
                manager_review_deadline: data.manager_review_deadline!,
                calibration_deadline: data.calibration_deadline?.trim() || null,
                final_review_deadline: data.final_review_deadline!,
                status: data.status || "draft",
                rating_scale: data.rating_scale || null,
                include_self_assessment: data.include_self_assessment ?? true,
                include_goals: data.include_goals ?? true,
                description: data.description?.trim() || null,
            });
            return res as unknown as { data: EvaluationCycle };
        },
        onSuccess: () => router.push("/dashboard/evaluation-cycles"),
        validate: (data) => {
            if (!data.name?.trim()) return "Name is required";
            if (!data.type) return "Type is required";
            if (!data.year) return "Year is required";
            if (!data.start_date) return "Start date is required";
            if (!data.end_date) return "End date is required";
            if (!data.self_assessment_deadline) return "Self assessment deadline is required";
            if (!data.manager_review_deadline) return "Manager review deadline is required";
            if (!data.final_review_deadline) return "Final review deadline is required";
            return null;
        },
    });

    return (
        <ProtectedPage permission={PERMISSIONS.EVALUATION_CYCLES.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create evaluation cycle</h1>
                    <p className="text-gray-600 mt-1">Add a new performance evaluation cycle</p>
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
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Year"
                            name="year"
                            type="number"
                            value={formData.year ?? currentYear}
                            onChange={(e) => updateField("year", e.target.value)}
                            required
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
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="End date"
                            name="end_date"
                            type="date"
                            value={formData.end_date ?? ""}
                            onChange={(e) => updateField("end_date", e.target.value)}
                            required
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
                            required
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Manager review deadline"
                            name="manager_review_deadline"
                            type="date"
                            value={formData.manager_review_deadline ?? ""}
                            onChange={(e) => updateField("manager_review_deadline", e.target.value)}
                            required
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
                            required
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
                            value={formData.include_self_assessment ?? true}
                            checked={formData.include_self_assessment ?? true}
                            onChange={(e) => updateField("include_self_assessment", (e.target as HTMLInputElement).checked)}
                            disabled={isSubmitting}
                        />
                        <FormField
                            label="Include goals"
                            name="include_goals"
                            type="checkbox"
                            value={formData.include_goals ?? true}
                            checked={formData.include_goals ?? true}
                            onChange={(e) => updateField("include_goals", (e.target as HTMLInputElement).checked)}
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
                    <ActionButtons submitLabel="Create evaluation cycle" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
