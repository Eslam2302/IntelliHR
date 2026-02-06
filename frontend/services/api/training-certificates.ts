import { API_URL } from "@/config/api";
import { fetchWithAuth, fetchWithAuthFormData, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { TrainingCertificate, TrainingCertificateListResponse } from "@/lib/types/training-certificate";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateTrainingCertificateData {
    employee_training_id: number;
    issued_at: string;
    certificate_path?: string | null;
}

export interface UpdateTrainingCertificateData {
    issued_at?: string;
    certificate_path?: string | null;
}

export interface GetTrainingCertificatesParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export async function getTrainingCertificates(params: GetTrainingCertificatesParams = {}): Promise<TrainingCertificateListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
    } = params;
    const url = buildQueryParams(`${API_URL}/training-certificates`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<TrainingCertificate>(response, page, perPage);
}

export async function getTrainingCertificate(id: number): Promise<TrainingCertificate> {
    const data = await fetchWithAuth(`${API_URL}/training-certificates/${id}`);
    return data.data ?? data;
}

export async function createTrainingCertificate(payload: CreateTrainingCertificateData): Promise<ApiResponse<TrainingCertificate>> {
    return fetchWithAuth(`${API_URL}/training-certificates`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateTrainingCertificate(id: number, payload: UpdateTrainingCertificateData): Promise<ApiResponse<TrainingCertificate>> {
    return fetchWithAuth(`${API_URL}/training-certificates/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteTrainingCertificate(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/training-certificates/${id}`, { method: "DELETE" });
}

/** Upload a certificate file. Returns the stored path to use in create/update. */
export async function uploadCertificateFile(file: File): Promise<{ path: string }> {
    const formData = new FormData();
    formData.append("certificate_file", file);
    const data = await fetchWithAuthFormData(`${API_URL}/training-certificates/upload`, formData, "POST");
    return { path: data.path };
}
