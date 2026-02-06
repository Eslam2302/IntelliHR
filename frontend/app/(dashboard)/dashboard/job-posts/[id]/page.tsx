"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEntity } from "@/hooks/useEntity";
import { getJobPost } from "@/services/api/job-posts";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { PageHeader } from "@/components/ui/PageHeader";
import type { JobPost } from "@/lib/types/job-post";

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

function statusBadge(status: string | null | undefined) {
    if (!status) return <span className="text-gray-500">—</span>;
    const map: Record<string, { bg: string; text: string }> = {
        open: { bg: "bg-green-100", text: "text-green-800" },
        closed: { bg: "bg-red-100", text: "text-red-800" },
    };
    const s = map[status] ?? { bg: "bg-gray-100", text: "text-gray-800" };
    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${s.bg} ${s.text}`}>
            {status}
        </span>
    );
}

export default function JobPostViewPage() {
    const params = useParams();
    const id = parseId(params.id);
    const { data: jobPost, isLoading, error } = useEntity<JobPost>({
        fetchFunction: getJobPost,
        entityId: id,
    });

    if (id === null) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Invalid job post ID</p>
                <Link href="/dashboard/job-posts" className="text-indigo-600 hover:underline">
                    Back to job posts
                </Link>
            </div>
        );
    }

    if (isLoading && !jobPost) {
        return (
            <div className="flex justify-center min-h-[400px] items-center">
                <div className="text-gray-500">Loading…</div>
            </div>
        );
    }

    if (error && !jobPost) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link href="/dashboard/job-posts" className="text-indigo-600 hover:underline">
                    Back to job posts
                </Link>
            </div>
        );
    }

    if (!jobPost) return null;

    return (
        <div className="space-y-6 bg-gray-50 min-h-full">
            <PageHeader
                title={jobPost.title}
                description={`Job post #${jobPost.id}`}
                action={
                    <PermissionGuard permission={PERMISSIONS.JOB_POSTS.EDIT}>
                        <Link
                            href={`/dashboard/job-posts/${jobPost.id}/edit`}
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
                        <DetailRow label="Title" value={jobPost.title} />
                        <DetailRow
                            label="Department"
                            value={
                                jobPost.department_id ? (
                                    <Link href={`/dashboard/departments/${jobPost.department_id}`} className="text-indigo-600 hover:underline">
                                        {jobPost.department?.name ?? `Department #${jobPost.department_id}`}
                                    </Link>
                                ) : null
                            }
                        />
                        <DetailRow label="Job type" value={jobPost.job_type} />
                        <DetailRow label="Status" value={statusBadge(jobPost.status)} />
                        <DetailRow label="Description" value={jobPost.description ? <div className="whitespace-pre-wrap">{jobPost.description}</div> : null} />
                        <DetailRow label="Requirements" value={jobPost.requirements ? <div className="whitespace-pre-wrap">{jobPost.requirements}</div> : null} />
                        <DetailRow label="Responsibilities" value={jobPost.responsibilities ? <div className="whitespace-pre-wrap">{jobPost.responsibilities}</div> : null} />
                        <DetailRow
                            label="Posted at"
                            value={jobPost.posted_at ? new Date(jobPost.posted_at).toLocaleString() : null}
                        />
                        <DetailRow label="LinkedIn Job ID" value={jobPost.linkedin_job_id} />
                        <DetailRow label="Created" value={jobPost.created_at ? new Date(jobPost.created_at).toLocaleString() : null} />
                        <DetailRow label="Updated" value={jobPost.updated_at ? new Date(jobPost.updated_at).toLocaleString() : null} />
                    </dl>
                </div>
            </div>
        </div>
    );
}
