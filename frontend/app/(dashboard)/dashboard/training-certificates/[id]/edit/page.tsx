"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTrainingCertificate, updateTrainingCertificate, uploadCertificateFile } from "@/services/api/training-certificates";
import { useEntity } from "@/hooks/useEntity";
import { useEntityForm } from "@/hooks/useEntityForm";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import { API_BASE_URL } from "@/config/api";
import type { TrainingCertificate } from "@/lib/types/training-certificate";
import type { UpdateTrainingCertificateData } from "@/services/api/training-certificates";

export default function EditTrainingCertificatePage() {
    const params = useParams();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const id = Number(params.id);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const { data: certificate, isLoading } = useEntity<TrainingCertificate>({
        fetchFunction: getTrainingCertificate,
        entityId: id,
    });

    const {
        formData,
        setFormData,
        updateField,
        handleSubmit,
        isSubmitting,
        error,
    } = useEntityForm<TrainingCertificate, UpdateTrainingCertificateData, UpdateTrainingCertificateData>({
        initialData: {
            issued_at: "",
            certificate_path: "",
        },
        entityId: id,
        updateFunction: async (entityId, data) => {
            const res = await updateTrainingCertificate(entityId, {
                issued_at: data.issued_at?.trim(),
                certificate_path: data.certificate_path?.trim() || null,
            });
            return res as unknown as { data: TrainingCertificate };
        },
        onSuccess: () => router.push(`/dashboard/training-certificates/${id}`),
        validate: () => null,
    });

    useEffect(() => {
        if (certificate) {
            setFormData({
                issued_at: certificate.issued_at ?? "",
                certificate_path: certificate.certificate_path ?? "",
            });
        }
    }, [certificate, setFormData]);

    if (isLoading && !certificate) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!certificate) return null;

    const certificateFileUrl = formData.certificate_path
        ? `${API_BASE_URL}/storage/${formData.certificate_path}`
        : null;

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
        <ProtectedPage permission={PERMISSIONS.TRAINING_CERTIFICATES.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit certificate</h1>
                    <p className="text-gray-600 mt-1">
                        {certificate.employee_training?.display_label ?? `Certificate #${certificate.id}`}
                    </p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
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
                            PDF or image (jpg, png), max 5 MB. Upload a new file to replace the current one.
                        </p>
                        {certificateFileUrl && (
                            <p className="mb-2 text-sm">
                                Current file:{" "}
                                <a
                                    href={certificateFileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:underline"
                                >
                                    {formData.certificate_path?.split("/").pop() ?? "View file"}
                                </a>
                            </p>
                        )}
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
                    </div>
                    <ActionButtons submitLabel="Update certificate" isSubmitting={isSubmitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
