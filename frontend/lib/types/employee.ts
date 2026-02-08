/**
 * Employee Types
 * TypeScript interfaces for Employee-related database tables and API responses
 */
import type { PaginatedResponse } from "./api";
import type { Department } from "./department";

// Job Position interface (when included in employee response)
export interface JobPosition {
  id: number;
  title: string;
  description?: string;
  department_id?: number;
  created_at?: string;
  updated_at?: string;
}

// Employee database table response
export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  work_email: string | null;
  phone: string | null;
  gender: "male" | "female";
  national_id: string;
  birth_date: string; // Date as string from API (YYYY-MM-DD)
  address: string | null;
  employee_status: "active" | "probation" | "resigned" | "terminated";
  department_id: number | null;
  manager_id: number | null;
  job_id: number | null;
  hire_date: string; // Date as string from API (YYYY-MM-DD)
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null; // For soft deletes
  // Relationships (when loaded with 'with' in Laravel)
  department?: Department | null;
  job?: JobPosition | null;
  manager?: Employee | null; // Self-referencing relationship
  roles?: string[]; // Role names when loaded
}

// For API responses with pagination
export type EmployeeListResponse = PaginatedResponse<Employee>;
