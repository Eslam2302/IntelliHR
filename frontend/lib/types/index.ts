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

// Benefit types
export type { Benefit, BenefitListResponse } from "./benefit";

// Allowance types
export type { Allowance, AllowanceListResponse } from "./allowance";

// Deduction types
export type { Deduction, DeductionListResponse } from "./deduction";

// Payroll types
export type { Payroll, PayrollListResponse } from "./payroll";
