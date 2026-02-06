"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createTrainingEvaluation } from "@/services/api/training-evaluations";
import { getEmployees } from "@/services/api/employees";
import { getTrainingSessions } from "@/services/api/training-sessions";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { TrainingEvaluation } from "@/lib/types/training-evaluation";
import type { CreateTrainingEvaluationData } from "@/services/api/training-evaluations";
import type { Employee } from "@/lib/types/employee";
import type { TrainingSession } from "@/lib/types/training-session";

const RATING_OPTIONS = [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" },
];

export default function NewTrainingEvaluationPage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [sessions, setSessions] = useState<TrainingSession[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    useEffect(() => {
        Promise.all([
            getEmployees({ perPage: 500, sortBy: "first_name", sortOrder: "asc" }),
            getTrainingSessions({ perPage: 500, sortBy: "title", sortOrder: "asc" }),
        ])
            .then(([emp, sess]) => {
                setEmployees(emp.data);
                setSessions(sess.data);
            })
            .catch(() => {})
            .finally(() => setLoadingOptions(false));
    }, []);

    const {
        formData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<TrainingEvaluation, CreateTrainingEvaluationData, CreateTrainingEvaluationData>({
        initialData: {
            employee_id: undefined as unknown as number,
            training_id: undefined as unknown as number,
            rating: 5,
            feedback: "",
        },
        createFunction: async (data) => {
            const res = await createTrainingEvaluation({
                employee_id: Number(data.employee_id)!,
                training_id: Number(data.training_id)!,
                rating: Number(data.rating)!,
                feedback: data.feedback?.trim() || null,
            });
            return res as unknown as { data: TrainingEvaluation };
        },
        onSuccess: () => router.push("/dashboard/training-evaluations"),
        validate: (data) => {
            if (!data.employee_id) return "Employee is required";
            if (!data.training_id) return "Training session is required";
            const rating = Number(data.rating);
            if (isNaN(rating) || rating < 1 || rating > 5) return "Rating must be between 1 and 5";
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

    const employeeOptions = employees.map((e) => ({
        value: e.id,
        label: `${e.first_name} ${e.last_name} (${e.work_email ?? "—"})`,
    }));
    const sessionOptions = sessions.map((s) => ({ value: s.id, label: s.title }));

    return (
        <ProtectedPage permission={PERMISSIONS.TRAINING_EVALUATIONS.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create evaluation</h1>
                    <p className="text-gray-600 mt-1">Add a training evaluation</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
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
                        label="Training session"
                        name="training_id"
                        type="select"
                        value={formData.training_id ?? ""}
                        onChange={(e) => updateField("training_id", e.target.value)}
                        options={sessionOptions}
                        required
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Rating (1–5)"
                        name="rating"
                        type="select"
                        value={formData.rating ?? ""}
                        onChange={(e) => updateField("rating", e.target.value)}
                        options={RATING_OPTIONS}
                        required
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Feedback"
                        name="feedback"
                        type="textarea"
                        value={formData.feedback ?? ""}
                        onChange={(e) => updateField("feedback", e.target.value)}
                        disabled={isSubmitting}
                        rows={4}
                    />
                    <ActionButtons submitLabel="Create evaluation" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
