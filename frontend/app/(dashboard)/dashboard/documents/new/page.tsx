"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createDocument } from "@/services/api/documents";
import { getEmployees } from "@/services/api/employees";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Employee } from "@/lib/types/employee";

export default function NewDocumentPage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [employeeId, setEmployeeId] = useState("");
    const [docType, setDocType] = useState("");
    const [attachment, setAttachment] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getEmployees({ perPage: 500, sortBy: "first_name", sortOrder: "asc" })
            .then((r) => setEmployees(r.data))
            .catch(() => setEmployees([]))
            .finally(() => setLoadingOptions(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!employeeId || !docType?.trim()) {
            setError("Employee and document type are required.");
            return;
        }
        if (!attachment) {
            setError("Please select a file to upload.");
            return;
        }
        try {
            setSubmitting(true);
            await createDocument({
                employee_id: Number(employeeId),
                doc_type: docType.trim(),
                attachment,
            });
            router.push("/dashboard/documents");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to upload document");
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingOptions) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading form…</div>
            </div>
        );
    }

    const employeeOptions = employees.map((e) => ({
        value: e.id,
        label: `${e.first_name} ${e.last_name} (${e.work_email})`,
    }));

    return (
        <ProtectedPage permission={PERMISSIONS.DOCUMENTS.CREATE}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Upload document</h1>
                    <p className="text-gray-600 mt-1">Add a new document for an employee</p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
                    <FormField
                        label="Employee"
                        name="employee_id"
                        type="select"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        options={employeeOptions}
                        required
                        disabled={submitting}
                    />
                    <FormField
                        label="Document type"
                        name="doc_type"
                        type="text"
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        placeholder="e.g. ID, Passport, Contract"
                        required
                        disabled={submitting}
                    />
                    <div>
                        <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-2">
                            File <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="attachment"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
                            disabled={submitting}
                            required
                            className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                        />
                        <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG, DOC, DOCX. Max 5MB.</p>
                    </div>
                    <ActionButtons submitLabel="Upload" isSubmitting={submitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
