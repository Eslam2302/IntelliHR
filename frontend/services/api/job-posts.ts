import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { JobPost, JobPostListResponse } from "@/lib/types/job-post";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateJobPostData {
    title: string;
    description?: string | null;
    requirements?: string | null;
    responsibilities?: string | null;
    department_id?: number | null;
    job_type?: string | null;
    status?: string | null;
    posted_at?: string | null;
    linkedin_job_id?: string | null;
}

export interface UpdateJobPostData {
    title?: string;
    description?: string | null;
    requirements?: string | null;
    responsibilities?: string | null;
    department_id?: number | null;
    job_type?: string | null;
    status?: string | null;
    posted_at?: string | null;
    linkedin_job_id?: string | null;
}

export interface GetJobPostsParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export async function getJobPosts(params: GetJobPostsParams = {}): Promise<JobPostListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
    } = params;
    const url = buildQueryParams(`${API_URL}/job-posts`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<JobPost>(response, page, perPage);
}

export async function getJobPost(id: number): Promise<JobPost> {
    const data = await fetchWithAuth(`${API_URL}/job-posts/${id}`);
    return data.data ?? data;
}

export async function createJobPost(payload: CreateJobPostData): Promise<ApiResponse<JobPost>> {
    return fetchWithAuth(`${API_URL}/job-posts`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateJobPost(id: number, payload: UpdateJobPostData): Promise<ApiResponse<JobPost>> {
    return fetchWithAuth(`${API_URL}/job-posts/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteJobPost(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/job-posts/${id}`, { method: "DELETE" });
}
