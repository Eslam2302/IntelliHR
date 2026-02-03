import type { PaginatedResponse } from "./api";

export interface Document {
    id: number;
    employee_id: number;
    employee?: { id: number; name?: string; first_name?: string; last_name?: string } | null;
    doc_type: string;
    file_path?: string | null;
    file_url: string | null;
    uploaded_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
}

/** Get display name for document's employee (first + last name, or fallback) */
export function getDocumentEmployeeName(
    doc: Pick<Document, "employee_id" | "employee">
): string {
    const emp = doc.employee;
    if (emp?.name) return emp.name;
    if (emp?.first_name != null || emp?.last_name != null) {
        return [emp?.first_name, emp?.last_name].filter(Boolean).join(" ").trim() || `Employee #${doc.employee_id}`;
    }
    return `Employee #${doc.employee_id}`;
}

export type DocumentListResponse = PaginatedResponse<Document>;
