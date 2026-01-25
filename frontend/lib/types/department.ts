/**
 * Department Types
 * TypeScript interfaces for Department-related database tables and API responses
 */
import type { PaginatedResponse } from "./api";

// Department database table response
export interface Department {
  id: number;
  name: string;
  description?: string;
  manager_id?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

// For API responses with pagination (uses generic PaginatedResponse)
export type DepartmentListResponse = PaginatedResponse<Department>;
