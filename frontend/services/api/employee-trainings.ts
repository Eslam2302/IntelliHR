import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { EmployeeTraining, EmployeeTrainingListResponse } from "@/lib/types/employee-training";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateEmployeeTrainingData {
    employee_id: number;
    training_id: number;
    status: string;
    completion_date?: string | null;
}

export interface UpdateEmployeeTrainingData {
    status?: string;
    completion_date?: string | null;
}

export interface GetEmployeeTrainingsParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export async function getEmployeeTrainings(params: GetEmployeeTrainingsParams = {}): Promise<EmployeeTrainingListResponse> {
    const {
        page = 1,
        perPage = 15,
        search,
        sortBy = "created_at",
        sortOrder = "desc",
    } = params;
    const url = buildQueryParams(`${API_URL}/employee-trainings`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<EmployeeTraining>(response, page, perPage);
}

export async function getEmployeeTraining(id: number): Promise<EmployeeTraining> {
    const data = await fetchWithAuth(`${API_URL}/employee-trainings/${id}`);
    return data.data ?? data;
}

export async function createEmployeeTraining(payload: CreateEmployeeTrainingData): Promise<ApiResponse<EmployeeTraining>> {
    return fetchWithAuth(`${API_URL}/employee-trainings`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateEmployeeTraining(id: number, payload: UpdateEmployeeTrainingData): Promise<ApiResponse<EmployeeTraining>> {
    return fetchWithAuth(`${API_URL}/employee-trainings/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteEmployeeTraining(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/employee-trainings/${id}`, { method: "DELETE" });
}
