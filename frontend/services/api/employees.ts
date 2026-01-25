import { API_URL } from "@/config/api";
import { fetchWithAuth, buildQueryParams, transformLaravelResponse } from "@/lib/utils/api";
import type { Employee, EmployeeListResponse } from "@/lib/types/employee";
import type { ApiResponse } from "@/lib/types/api";

export interface CreateEmployeeData {
    first_name: string;
    last_name: string;
    work_email?: string;
    phone?: string;
    gender: "male" | "female";
    national_id: string;
    birth_date: string;
    address?: string;
    department_id: number;
    manager_id?: number;
    job_id?: number;
    hire_date: string;
    employee_status?: "active" | "probation" | "resigned" | "terminated";
}

export interface UpdateEmployeeData {
    first_name?: string;
    last_name?: string;
    work_email?: string;
    phone?: string;
    gender?: "male" | "female";
    national_id?: string;
    birth_date?: string;
    address?: string;
    department_id?: number;
    manager_id?: number;
    job_id?: number;
    hire_date?: string;
    employee_status?: "active" | "probation" | "resigned" | "terminated";
}

export interface GetEmployeesParams {
    page?: number;
    perPage?: number;
    search?: string;
    sortBy?: "id" | "first_name" | "last_name" | "work_email" | "phone" | "gender" | "national_id" | "birth_date" | "address" | "department_id" | "manager_id" | "job_id" | "hire_date" | "employee_status" | "created_at" | "updated_at";
    sortOrder?: "asc" | "desc";
    deleted?: "without" | "only" | "with";
}

export async function getEmployees(params: GetEmployeesParams = {}): Promise<EmployeeListResponse> {
    const {
        page = 1,
        perPage = 10,
        search,
        sortBy = "id",
        sortOrder = "desc",
        deleted = "without",
    } = params;

    const url = buildQueryParams(`${API_URL}/employees`, {
        page,
        perPage,
        search,
        sortBy,
        sortOrder,
        deleted,
    });
    const response = await fetchWithAuth(url);
    return transformLaravelResponse<Employee>(response, page, perPage);

}

export async function getEmployee(id: number): Promise<Employee> {
    const data = await fetchWithAuth(`${API_URL}/employees/${id}`);
    return data.data || data;
}

export async function createEmployee(EmployeeData: CreateEmployeeData): Promise<ApiResponse<Employee>> {
    return fetchWithAuth(`${API_URL}/employees` , {
        method: "POST",
        body: JSON.stringify(EmployeeData),
    });
}

export async function updateEmployee(id: number, EmployeeData: UpdateEmployeeData): Promise<ApiResponse<Employee>> {
    return fetchWithAuth(`${API_URL}/employees/${id}`, {
        method: "PUT",
        body: JSON.stringify(EmployeeData),
    });
}

export async function deleteEmployee(id: number): Promise<void> {
    await fetchWithAuth(`${API_URL}/employees/${id}`, {
        method: "DELETE",
    });
}