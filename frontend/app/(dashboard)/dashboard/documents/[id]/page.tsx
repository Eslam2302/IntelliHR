"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEntity } from "@/hooks/useEntity";
import { getDocument, getDocumentFileUrl } from "@/services/api/documents";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Document } from "@/lib/types/document";
import { getDocumentEmployeeName } from "@/lib/types/document";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"];
function isImageFile(filePath: string | null | undefined): boolean {
    if (!filePath) return false;
    const ext = filePath.toLowerCase().slice(filePath.lastIndexOf("."));
    return IMAGE_EXTENSIONS.includes(ext);
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="py-3 border-b border-gray-100 last:border-0">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900">{value ?? "—"}</dd>
        </div>
    );
}

export default function DocumentViewPage() {
    const params = useParams();
    const id = Number(params.id);
    const [downloading, setDownloading] = useState(false);
    const { data: document, isLoading, error } = useEntity<Document>({
        fetchFunction: getDocument,
        entityId: id,
    });

    const handleDownload = async () => {
        if (!document?.id) return;
        try {
            setDownloading(true);
            const { url } = await getDocumentFileUrl(document.id);
            window.open(url, "_blank");
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to get download link");
        } finally {
            setDownloading(false);
        }
    };

    if (isLoading && !document) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (error && !document) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/dashboard/documents" className="text-indigo-600 hover:underline">
                    Back to documents
                </Link>
            </div>
        );
    }

    if (!document) return null;

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title={`Document #${document.id}`}
                description={document.doc_type}
                action={
                    <div className="flex items-center gap-3">
                        {(document.file_path ?? document.file_url) && (
                            <PermissionGuard permission={PERMISSIONS.DOCUMENTS.VIEW}>
                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    disabled={downloading}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50"
                                >
                                    {downloading ? "Opening…" : "Download"}
                                </button>
                            </PermissionGuard>
                        )}
                        <PermissionGuard permission={PERMISSIONS.DOCUMENTS.EDIT}>
                            <Link
                                href={`/dashboard/documents/${document.id}/edit`}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                            >
                                Edit
                            </Link>
                        </PermissionGuard>
                    </div>
                }
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                    <dl className="divide-y divide-gray-100">
                        <DetailRow
                            label="Employee"
                            value={
                                document.employee_id ? (
                                    <Link href={`/dashboard/employees/${document.employee_id}`} className="text-indigo-600 hover:underline">
                                        {getDocumentEmployeeName(document)}
                                    </Link>
                                ) : null
                            }
                        />
                        <DetailRow label="Document type" value={document.doc_type} />
                        <DetailRow
                            label="File"
                            value={
                                document.file_url ? (
                                        <div className="space-y-3">
                                            {isImageFile(document.file_path) && (
                                                <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 max-w-md">
                                                    <img
                                                        src={document.file_url}
                                                        alt={document.doc_type}
                                                        className="max-h-96 w-full object-contain"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = "none";
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <a href={document.file_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline inline-block">
                                                View / Download
                                            </a>
                                        </div>
                                ) : null
                            }
                        />
                        <DetailRow
                            label="Uploaded"
                            value={document.uploaded_at ? new Date(document.uploaded_at).toLocaleString() : null}
                        />
                        <DetailRow
                            label="Created"
                            value={document.created_at ? new Date(document.created_at).toLocaleString() : null}
                        />
                        <DetailRow
                            label="Updated"
                            value={document.updated_at ? new Date(document.updated_at).toLocaleString() : null}
                        />
                    </dl>
                </div>
            </div>
        </div>
    );
}
