"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createEmployeeTraining } from "@/services/api/employee-trainings";
import { getEmployees } from "@/services/api/employees";
import { getTrainingSessions } from "@/services/api/training-sessions";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { EmployeeTraining } from "@/lib/types/employee-training";
import type { CreateEmployeeTrainingData } from "@/services/api/employee-trainings";
import type { Employee } from "@/lib/types/employee";
import type { TrainingSession } from "@/lib/types/training-session";

const STATUS_OPTIONS = [
    { value: "enrolled", label: "Enrolled" },
    { value: "in_progress", label: "In progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

export default function NewEmployeeTrainingPage() {
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
    } = useEntityForm<EmployeeTraining, CreateEmployeeTrainingData, CreateEmployeeTrainingData>({
        initialData: {
            employee_id: undefined as unknown as number,
            training_id: undefined as unknown as number,
            status: "enrolled",
            completion_date: "",
        },
        createFunction: async (data) => {
            const res = await createEmployeeTraining({
                employee_id: Number(data.employee_id)!,
                training_id: Number(data.training_id)!,
                status: data.status!,
                completion_date: data.completion_date?.trim() || null,
            });
            return res as unknown as { data: EmployeeTraining };
        },
        onSuccess: () => router.push("/dashboard/employee-trainings"),
        validate: (data) => {
            if (!data.employee_id) return "Employee is required";
            if (!data.training_id) return "Training session is required";
            if (!data.status?.trim()) return "Status is required";
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
        <ProtectedPage permission={PERMISSIONS.EMPLOYEE_TRAININGS.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Assign training</h1>
                    <p className="text-gray-600 mt-1">Assign an employee to a training session</p>
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
                        label="Status"
                        name="status"
                        type="select"
                        value={formData.status ?? ""}
                        onChange={(e) => updateField("status", e.target.value)}
                        options={STATUS_OPTIONS}
                        required
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Completion date"
                        name="completion_date"
                        type="date"
                        value={formData.completion_date ?? ""}
                        onChange={(e) => updateField("completion_date", e.target.value)}
                        disabled={isSubmitting}
                    />
                    <ActionButtons submitLabel="Assign training" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
