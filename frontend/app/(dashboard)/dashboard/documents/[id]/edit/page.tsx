"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDocument, updateDocument } from "@/services/api/documents";
import { useEntity } from "@/hooks/useEntity";
import { ProtectedPage } from "@/components/common/ProtectedPage";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { FormContainer } from "@/components/forms/FormContainer";
import { FormField } from "@/components/forms/FormField";
import { ActionButtons } from "@/components/forms/ActionButtons";
import type { Document } from "@/lib/types/document";

export default function EditDocumentPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    const { data: document, isLoading } = useEntity<Document>({
        fetchFunction: getDocument,
        entityId: id,
    });

    const [docType, setDocType] = useState("");
    const [attachment, setAttachment] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (document) setDocType(document.doc_type ?? "");
    }, [document]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!document) return;
        setError(null);
        if (!docType?.trim()) {
            setError("Document type is required.");
            return;
        }
        try {
            setSubmitting(true);
            await updateDocument(id, {
                doc_type: docType.trim(),
                ...(attachment && { attachment }),
            });
            router.push(`/dashboard/documents/${id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update document");
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading && !document) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (!document) return null;

    return (
        <ProtectedPage permission={PERMISSIONS.DOCUMENTS.EDIT}>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit document</h1>
                    <p className="text-gray-600 mt-1">
                        {document.employee?.name ?? `Employee #${document.employee_id}`}
                    </p>
                </div>
                <FormContainer onSubmit={handleSubmit} error={error}>
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
                            Replace file (optional)
                        </label>
                        <input
                            id="attachment"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
                            disabled={submitting}
                            className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Leave empty to keep current file. PDF, JPG, PNG, DOC, DOCX. Max 5MB.
                        </p>
                        {document.file_url && (
                            <p className="mt-2">
                                <a href={document.file_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm">
                                    Current file
                                </a>
                            </p>
                        )}
                    </div>
                    <ActionButtons submitLabel="Update" isSubmitting={submitting} />
                </FormContainer>
            </div>
        </ProtectedPage>
    );
}
