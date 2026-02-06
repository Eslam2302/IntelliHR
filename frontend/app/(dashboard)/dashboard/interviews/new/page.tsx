"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createInterview } from "@/services/api/interviews";
import { getApplicants } from "@/services/api/applicants";
import { getEmployees } from "@/services/api/employees";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Interview } from "@/lib/types/interview";
import type { CreateInterviewData } from "@/services/api/interviews";
import type { Applicant } from "@/lib/types/applicant";
import type { Employee } from "@/lib/types/employee";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";

const STATUS_OPTIONS = [
    { value: "scheduled", label: "Scheduled" },
    { value: "done", label: "Done" },
    { value: "canceled", label: "Canceled" },
];

export default function NewInterviewPage() {
    const router = useRouter();
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    useEffect(() => {
        Promise.all([
            getApplicants({ perPage: 500, sortBy: "first_name", sortOrder: "asc" }),
            getEmployees({ perPage: 500, sortBy: "first_name", sortOrder: "asc" }),
        ])
            .then(([app, emp]) => {
                setApplicants(app.data);
                setEmployees(emp.data);
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
    } = useEntityForm<Interview, CreateInterviewData, CreateInterviewData>({
        initialData: {
            applicant_id: undefined as unknown as number,
            interviewer_id: undefined as unknown as number,
            scheduled_at: "",
            score: undefined as unknown as number,
            notes: "",
            status: "scheduled",
        },
        createFunction: async (data) => {
            const res = await createInterview({
                applicant_id: Number(data.applicant_id)!,
                interviewer_id: data.interviewer_id ? Number(data.interviewer_id) : null,
                scheduled_at: data.scheduled_at!.trim(),
                score: data.score ? Number(data.score) : null,
                notes: data.notes?.trim() || null,
                status: data.status || null,
            });
            return res as unknown as { data: Interview };
        },
        onSuccess: () => router.push("/dashboard/interviews"),
        validate: (data) => {
            if (!data.applicant_id) return "Applicant is required";
            if (!data.scheduled_at?.trim()) return "Scheduled at is required";
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

    const applicantOptions = applicants.map((a) => ({
        value: a.id,
        label: `${a.first_name} ${a.last_name}${a.job ? ` - ${a.job.title}` : ""}`,
    }));
    const employeeOptions = employees.map((e) => ({
        value: e.id,
        label: getEmployeeDisplayLabel(e, e.id),
    }));

    return (
        <ProtectedPage permission={PERMISSIONS.INTERVIEWS.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create interview</h1>
                    <p className="text-gray-600 mt-1">Schedule a new interview</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <FormField
                        label="Applicant"
                        name="applicant_id"
                        type="select"
                        value={formData.applicant_id ?? ""}
                        onChange={(e) => updateField("applicant_id", e.target.value)}
                        options={applicantOptions}
                        required
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Interviewer"
                        name="interviewer_id"
                        type="select"
                        value={formData.interviewer_id ?? ""}
                        onChange={(e) => updateField("interviewer_id", e.target.value)}
                        options={employeeOptions}
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Scheduled at"
                        name="scheduled_at"
                        type="datetime-local"
                        value={formData.scheduled_at ?? ""}
                        onChange={(e) => updateField("scheduled_at", e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="Score"
                            name="score"
                            type="number"
                            value={formData.score ?? ""}
                            onChange={(e) => updateField("score", e.target.value)}
                            disabled={isSubmitting}
                            min={0}
                            max={100}
                        />
                        <FormField
                            label="Status"
                            name="status"
                            type="select"
                            value={formData.status ?? ""}
                            onChange={(e) => updateField("status", e.target.value)}
                            options={STATUS_OPTIONS}
                            disabled={isSubmitting}
                        />
                    </div>
                    <FormField
                        label="Notes"
                        name="notes"
                        type="textarea"
                        value={formData.notes ?? ""}
                        onChange={(e) => updateField("notes", e.target.value)}
                        disabled={isSubmitting}
                        rows={4}
                    />
                    <ActionButtons submitLabel="Create interview" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
