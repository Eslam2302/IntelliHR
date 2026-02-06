"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createTrainingCertificate, uploadCertificateFile } from "@/services/api/training-certificates";
import { getEmployeeTrainings } from "@/services/api/employee-trainings";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { TrainingCertificate } from "@/lib/types/training-certificate";
import type { CreateTrainingCertificateData } from "@/services/api/training-certificates";
import type { EmployeeTraining } from "@/lib/types/employee-training";

function employeeTrainingLabel(et: EmployeeTraining): string {
    const emp = et.employee?.name ?? `Employee #${et.employee_id}`;
    const sess = et.training_session?.title ?? `Session #${et.training_id}`;
    return `#${et.id}: ${emp} – ${sess}`;
}

export default function NewTrainingCertificatePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [employeeTrainings, setEmployeeTrainings] = useState<EmployeeTraining[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    useEffect(() => {
        getEmployeeTrainings({ perPage: 500, sortBy: "id", sortOrder: "desc" })
            .then((r) => setEmployeeTrainings(r.data))
            .catch(() => setEmployeeTrainings([]))
            .finally(() => setLoadingOptions(false));
    }, []);

    const {
        formData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<TrainingCertificate, CreateTrainingCertificateData, CreateTrainingCertificateData>({
        initialData: {
            employee_training_id: undefined as unknown as number,
            issued_at: "",
            certificate_path: "",
        },
        createFunction: async (data) => {
            const res = await createTrainingCertificate({
                employee_training_id: Number(data.employee_training_id)!,
                issued_at: data.issued_at!,
                certificate_path: data.certificate_path?.trim() || null,
            });
            return res as unknown as { data: TrainingCertificate };
        },
        onSuccess: () => router.push("/dashboard/training-certificates"),
        validate: (data) => {
            if (!data.employee_training_id) return "Employee training is required";
            if (!data.issued_at?.trim()) return "Issued date is required";
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

    const options = employeeTrainings.map((et) => ({
        value: et.id,
        label: employeeTrainingLabel(et),
    }));

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadError(null);
        setUploading(true);
        try {
            const { path } = await uploadCertificateFile(file);
            updateField("certificate_path", path);
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    return (
        <ProtectedPage permission={PERMISSIONS.TRAINING_CERTIFICATES.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create certificate</h1>
                    <p className="text-gray-600 mt-1">Issue a training certificate</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <FormField
                        label="Employee training"
                        name="employee_training_id"
                        type="select"
                        value={formData.employee_training_id ?? ""}
                        onChange={(e) => updateField("employee_training_id", e.target.value)}
                        options={options}
                        required
                        disabled={isSubmitting}
                    />
                    <FormField
                        label="Issued at"
                        name="issued_at"
                        type="date"
                        value={formData.issued_at ?? ""}
                        onChange={(e) => updateField("issued_at", e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Certificate file (optional)
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                            PDF or image (jpg, png), max 5 MB. Upload a file and it will be stored for this certificate.
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            disabled={isSubmitting || uploading}
                            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:cursor-pointer disabled:opacity-50"
                        />
                        {uploading && <p className="mt-1 text-sm text-gray-500">Uploading…</p>}
                        {uploadError && <p className="mt-1 text-sm text-red-600">{uploadError}</p>}
                        {formData.certificate_path && !uploadError && (
                            <p className="mt-1 text-sm text-green-600">File uploaded: {formData.certificate_path.split("/").pop()}</p>
                        )}
                    </div>
                    <ActionButtons submitLabel="Create certificate" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
