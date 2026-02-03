/**
 * API Configuration
 * This file contains the base URL for your backend API
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/** Base URL for backend (without /api) - used for storage file URLs */
export const API_BASE_URL = API_URL.replace(/\/api\/?$/, "") || "http://localhost:8000";
