import { API_URL } from "@/config/api";
import { fetchWithAuth, fetchWithAuthFormData, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { Applicant, ApplicantListResponse } from "@/lib/types/applicant";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateApplicantData {
    job_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    is_employee?: boolean;
    status?: string | null;
    source?: string | null;
    experience_years?: number | null;
    current_stage_id?: number | null;
    /**
     * Optional direct resume path (server-side) – typically omitted when uploading a file.
     */
    resume_path?: string | null;
    applied_at?: string | null;
    /**
     * Resume file to upload (sent as multipart/form-data under `resume`).
     */
    resume?: File | null;
}

export interface UpdateApplicantData {
    job_id?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string | null;
    is_employee?: boolean;
    status?: string | null;
    source?: string | null;
    experience_years?: number | null;
    current_stage_id?: number | null;
    /**
     * Optional direct resume path override.
     */
    resume_path?: string | null;
    applied_at?: string | null;
    /**
     * Optional new resume file to upload.
     */
    resume?: File | null;
}

export interface GetApplicantsParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export async function getApplicants(params: GetApplicantsParams = {}): Promise<ApplicantListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
    } = params;
    const url = buildQueryParams(`${API_URL}/applicants`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Applicant>(response, page, perPage);
}

export async function getApplicant(id: number): Promise<Applicant> {
    const data = await fetchWithAuth(`${API_URL}/applicants/${id}`);
    return data.data ?? data;
}

export async function getApplicantsByJobPost(jobPostId: number, params: GetApplicantsParams = {}): Promise<ApplicantListResponse> {
    const { page = 1, perPage = 15 } = params;
    const url = buildQueryParams(`${API_URL}/job-posts/${jobPostId}/applicants`, { page, perPage });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Applicant>(response, page, perPage);
}

export async function createApplicant(payload: CreateApplicantData): Promise<ApiResponse<Applicant>> {
    const formData = new FormData();

    formData.append("job_id", String(payload.job_id));
    formData.append("first_name", payload.first_name);
    formData.append("last_name", payload.last_name);
    formData.append("email", payload.email);

    if (payload.phone != null) {
        formData.append("phone", payload.phone);
    }
    if (payload.is_employee != null) {
        formData.append("is_employee", payload.is_employee ? "1" : "0");
    }
    if (payload.status != null) {
        formData.append("status", payload.status);
    }
    if (payload.source != null) {
        formData.append("source", payload.source);
    }
    if (payload.experience_years != null) {
        formData.append("experience_years", String(payload.experience_years));
    }
    if (payload.current_stage_id != null) {
        formData.append("current_stage_id", String(payload.current_stage_id));
    }
    if (payload.applied_at != null) {
        formData.append("applied_at", payload.applied_at);
    }

    // Prefer file upload when provided; otherwise allow explicit resume_path.
    if (payload.resume instanceof File) {
        formData.append("resume", payload.resume);
    } else if (payload.resume_path) {
        formData.append("resume_path", payload.resume_path);
    }

    return fetchWithAuthFormData(`${API_URL}/applicants`, formData, "POST");
}

export async function updateApplicant(id: number, payload: UpdateApplicantData): Promise<ApiResponse<Applicant>> {
    const formData = new FormData();

    if (payload.job_id != null) {
        formData.append("job_id", String(payload.job_id));
    }
    if (payload.first_name != null) {
        formData.append("first_name", payload.first_name);
    }
    if (payload.last_name != null) {
        formData.append("last_name", payload.last_name);
    }
    if (payload.email != null) {
        formData.append("email", payload.email);
    }
    if (payload.phone != null) {
        formData.append("phone", payload.phone);
    }
    if (payload.is_employee != null) {
        formData.append("is_employee", payload.is_employee ? "1" : "0");
    }
    if (payload.status != null) {
        formData.append("status", payload.status);
    }
    if (payload.source != null) {
        formData.append("source", payload.source);
    }
    if (payload.experience_years != null) {
        formData.append("experience_years", String(payload.experience_years));
    }
    if (payload.current_stage_id != null) {
        formData.append("current_stage_id", String(payload.current_stage_id));
    }
    if (payload.applied_at != null) {
        formData.append("applied_at", payload.applied_at);
    }

    if (payload.resume instanceof File) {
        formData.append("resume", payload.resume);
    } else if (payload.resume_path != null) {
        formData.append("resume_path", payload.resume_path);
    }

    return fetchWithAuthFormData(`${API_URL}/applicants/${id}`, formData, "PUT");
}

export async function deleteApplicant(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/applicants/${id}`, { method: "DELETE" });
}
