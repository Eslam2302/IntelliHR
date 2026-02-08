import { API_URL } from "@/config/api";
import { fetchWithAuth, fetchWithAuthFormData, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { Document, DocumentListResponse } from "@/lib/types/document";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateDocumentData {
    employee_id: number;
    doc_type: string;
    attachment: File;
}

export interface UpdateDocumentData {
    doc_type?: string;
    attachment?: File;
}

export interface GetDocumentsParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    deleted?: "without" | "only" | "with";
}

export async function getDocuments(params: GetDocumentsParams = {}): Promise<DocumentListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
        deleted = "without",
    } = params;
    const url = buildQueryParams(`${API_URL}/documents`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
        deleted,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Document>(response, page, perPage);
}

export async function getDocument(id: number): Promise<Document> {
    const data = await fetchWithAuth(`${API_URL}/documents/${id}`);
    return data.data ?? data;
}

export async function getDocumentsByEmployee(employeeId: number, perPage = 10): Promise<DocumentListResponse> {
    const url = buildQueryParams(`${API_URL}/employees/${employeeId}/documents`, { perPage });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Document>(response, 1, perPage);
}

export async function createDocument(payload: CreateDocumentData): Promise<ApiResponse<Document>> {
    const form = new FormData();
    form.append("employee_id", String(payload.employee_id));
    form.append("doc_type", payload.doc_type);
    form.append("attachment", payload.attachment);
    return fetchWithAuthFormData(`${API_URL}/documents`, form, "POST") as Promise<ApiResponse<Document>>;
}

export async function updateDocument(id: number, payload: UpdateDocumentData): Promise<ApiResponse<Document>> {
    const form = new FormData();
    if (payload.doc_type != null) form.append("doc_type", payload.doc_type);
    if (payload.attachment) form.append("attachment", payload.attachment);
    form.append("_method", "PUT");
    return fetchWithAuthFormData(`${API_URL}/documents/${id}`, form, "POST") as Promise<ApiResponse<Document>>;
}

export async function deleteDocument(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/documents/${id}`, { method: "DELETE" });
}

/**
 * Get a temporary signed URL to download/view the document file.
 */
export async function getDocumentFileUrl(id: number): Promise<{ url: string }> {
    const data = await fetchWithAuth(`${API_URL}/documents/${id}/file-url`);
    const url = data.url ?? (data.data && (data.data as { url?: string }).url);
    if (!url || typeof url !== "string") {
        throw new Error("Failed to get document download URL");
    }
    return { url };
}
