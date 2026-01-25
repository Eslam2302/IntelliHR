/**
 * Generic API Types
 * Common types used across all API responses
 */

// Generic paginated response (used by all list endpoints)
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from?: number;
  to?: number;
}

// Generic API error response
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// Generic API success response
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}
