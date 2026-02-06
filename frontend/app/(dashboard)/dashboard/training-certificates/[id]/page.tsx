"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEntity } from "@/hooks/useEntity";
import { getTrainingCertificate } from "@/services/api/training-certificates";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import { API_BASE_URL } from "@/config/api";
import type { TrainingCertificate } from "@/lib/types/training-certificate";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="py-3 border-b border-gray-100 last:border-0">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900">{value ?? "—"}</dd>
        </div>
    );
}

function parseId(param: string | string[] | undefined): number | null {
    const raw = Array.isArray(param) ? param[0] : param;
    if (typeof raw !== "string" || raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
}

export default function TrainingCertificateViewPage() {
    const params = useParams();
    const id = parseId(params.id);
    const { data: certificate, isLoading, error } = useEntity<TrainingCertificate>({
        fetchFunction: getTrainingCertificate,
        entityId: id,
    });

    if (id === null) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Invalid certificate ID</p>
                <Link href="/dashboard/training-certificates" className="text-indigo-600 hover:underline">
                    Back to certificates
                </Link>
            </div>
        );
    }

    if (isLoading && !certificate) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (error && !certificate) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/dashboard/training-certificates" className="text-indigo-600 hover:underline">
                    Back to certificates
                </Link>
            </div>
        );
    }

    if (!certificate) return null;

    const certificateFileUrl = certificate.certificate_path
        ? `${API_BASE_URL}/storage/${certificate.certificate_path}`
        : null;

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title={certificate.employee_training?.display_label ?? `Certificate #${certificate.id}`}
                description={`Issued ${certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString("en-US") : "—"}`}
                action={
                    <PermissionGuard permission={PERMISSIONS.TRAINING_CERTIFICATES.EDIT}>
                        <Link
                            href={`/dashboard/training-certificates/${certificate.id}/edit`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </Link>
                    </PermissionGuard>
                }
            />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                    <dl className="divide-y divide-gray-100">
                        <DetailRow
                            label="Employee training"
                            value={
                                <Link href={`/dashboard/employee-trainings/${certificate.employee_training_id}`} className="text-indigo-600 hover:underline">
                                    {certificate.employee_training?.display_label ?? `Record #${certificate.employee_training_id}`}
                                </Link>
                            }
                        />
                        <DetailRow
                            label="Issued at"
                            value={certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null}
                        />
                        <DetailRow
                            label="Certificate file"
                            value={
                                certificateFileUrl ? (
                                    <a href={certificateFileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                        {certificate.certificate_path?.split("/").pop() ?? "View file"}
                                    </a>
                                ) : (
                                    "—"
                                )
                            }
                        />
                        <DetailRow label="Created" value={certificate.created_at ? new Date(certificate.created_at).toLocaleString() : null} />
                        <DetailRow label="Updated" value={certificate.updated_at ? new Date(certificate.updated_at).toLocaleString() : null} />
                    </dl>
                </div>
            </div>
        </div>
    );
}
