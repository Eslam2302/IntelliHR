/**
 * Types Index
 * Central export point for all TypeScript types
 *
 * Usage: import { User, Employee, Department, PaginatedResponse } from "@/lib/types"
 */

// User types
export type { User, LoginResponse, LoginCredentials } from "./user";

// Employee types
export type { Employee, EmployeeListResponse } from "./employee";

// Department types
export type { Department, DepartmentListResponse } from "./department";

// Generic API types
export type { PaginatedResponse, ApiError, ApiResponse } from "./api";
