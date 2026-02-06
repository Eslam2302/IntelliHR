"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getInterview, updateInterview } from "@/services/api/interviews";
import { getApplicants } from "@/services/api/applicants";
import { getEmployees } from "@/services/api/employees";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Interview } from "@/lib/types/interview";
import type { UpdateInterviewData } from "@/services/api/interviews";
import type { Applicant } from "@/lib/types/applicant";
import type { Employee } from "@/lib/types/employee";
import { getEmployeeDisplayLabel } from "@/lib/utils/display";

const STATUS_OPTIONS = [
    { value: "scheduled", label: "Scheduled" },
    { value: "done", label: "Done" },
    { value: "canceled", label: "Canceled" },
];

export default function EditInterviewPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);
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

    const { data: interview, isLoading } = useEntity<Interview>({
        fetchFunction: getInterview,
        entityId: id,
    });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<Interview, UpdateInterviewData, UpdateInterviewData>({
        initialData: {
            applicant_id: undefined as unknown as number,
            interviewer_id: undefined as unknown as number,
            scheduled_at: "",
            score: undefined as unknown as number,
            notes: "",
            status: "scheduled",
        },
        entityId: id,
        updateFunction: async (entityId, data) => {
            const res = await updateInterview(entityId, {
                applicant_id: data.applicant_id ? Number(data.applicant_id) : undefined,
                interviewer_id: data.interviewer_id ? Number(data.interviewer_id) : null,
                scheduled_at: data.scheduled_at ? data.scheduled_at.trim() : undefined,
                score: data.score ? Number(data.score) : null,
                notes: data.notes?.trim() || null,
                status: data.status || null,
            });
            return res as unknown as { data: Interview };
        },
        onSuccess: () => router.push(`/dashboard/interviews/${id}`),
        validate: (data) => {
            if (data.score) {
                const score = Number(data.score);
                if (isNaN(score) || score < 0 || score > 100) return "Score must be between 0 and 100";
            }
            return null;
        },
    });

    useEffect(() => {
        if (interview) {
            setFormData({
                applicant_id: interview.applicant_id ?? undefined,
                interviewer_id: interview.interviewer_id ?? undefined,
                scheduled_at: interview.scheduled_at ? new Date(interview.scheduled_at).toISOString().slice(0, 16) : "",
                score: interview.score ?? undefined,
                notes: interview.notes ?? "",
                status: interview.status ?? "scheduled",
            });
        }
    }, [interview, setFormData]);

    if (isLoading && !interview) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!interview) return null;

    const applicantOptions = applicants.map((a) => ({
        value: a.id,
        label: `${a.first_name} ${a.last_name}${a.job ? ` - ${a.job.title}` : ""}`,
    }));
    const employeeOptions = employees.map((e) => ({
        value: e.id,
        label: getEmployeeDisplayLabel(e, e.id),
    }));

    return (
        <ProtectedPage permission={PERMISSIONS.INTERVIEWS.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit interview</h1>
                    <p className="text-gray-600 mt-1">Interview #{interview.id}</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <FormField
                        label="Applicant"
                        name="applicant_id"
                        type="select"
                        value={formData.applicant_id ?? ""}
                        onChange={(e) => updateField("applicant_id", e.target.value)}
                        options={applicantOptions}
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
                    <ActionButtons submitLabel="Update interview" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
