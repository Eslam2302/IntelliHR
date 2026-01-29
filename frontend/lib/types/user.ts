/**
 * User Types
 * TypeScript interfaces for User-related database tables and API responses
 */
import type { Employee } from "./employee";

// User database table response
// Note: User table references Employee table through employee_id
export interface User {
  id: number;
  employee_id: number;
  employee: Employee;
  personal_email?: string;
  email?: string;
  permissions?: string[]; // Backend /user endpoint returns permissions here
  created_at?: string;
  updated_at?: string;
}

// API Response types (what comes from backend)
export interface LoginResponse {
  status: string;
  message: string;
  token: string;
  user?: {
    id: string;
    role: string;
    permissions: string[]; // Backend returns permissions in user.permissions
  };
}

export interface LoginCredentials {
  employee_id: string;
  password: string;
}
