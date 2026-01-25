"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function AccessDeniedPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const from = searchParams.get("from") || "this page";
    const required = searchParams.get("required") || "";
    const userPerms = searchParams.get("userPerms") || "";
    const reason = searchParams.get("reason") || "";

    // Parse required permissions (comma-separated)
    const requiredPermissions = required
        ? required.split(",").map((p) => p.trim()).filter(Boolean)
        : [];

    // Parse user permissions (comma-separated)
    const userPermissions = userPerms
        ? userPerms.split(",").map((p) => p.trim()).filter(Boolean)
        : [];

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
            <div className="text-center max-w-lg w-full">
                {/* Icon */}
                <div className="mb-6">
                    <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-lg">
                        <svg
                            className="h-14 w-14 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-label="Access Denied"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Access Denied
                    </h1>

                    {/* Main Message */}
                    <p className="text-lg text-gray-700 mb-2">
                        You don't have permission to access this resource.
                    </p>
                    <p className="text-sm text-gray-600 mb-6">
                        Attempted to access: <span className="font-mono font-semibold text-gray-800">{from}</span>
                    </p>

                    {/* Reason Message */}
                    {reason === "no-permissions-found" && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                <strong>Note:</strong> Your permissions could not be verified. Please try logging in again.
                            </p>
                        </div>
                    )}

                    {/* Permission Details */}
                    {requiredPermissions.length > 0 && (
                        <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200 text-left">
                            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <svg
                                    className="h-4 w-4 text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                Required Permission{requiredPermissions.length > 1 ? "s" : ""}
                            </h2>
                            <div className="space-y-2">
                                {requiredPermissions.map((perm, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200"
                                    >
                                        <span className="text-xs font-mono text-gray-800 flex-1 text-left">
                                            {perm}
                                        </span>
                                        {userPermissions.includes(perm) ? (
                                            <span className="text-xs text-green-600 font-semibold">
                                                ✓ You have this
                                            </span>
                                        ) : (
                                            <span className="text-xs text-red-600 font-semibold">
                                                ✗ Missing
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* User Permissions Summary */}
                            {userPermissions.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h3 className="text-xs font-semibold text-gray-700 mb-2">
                                        Your Current Permissions ({userPermissions.length})
                                    </h3>
                                    <div className="flex flex-wrap gap-1">
                                        {userPermissions.slice(0, 5).map((perm, index) => (
                                            <span
                                                key={index}
                                                className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-200"
                                            >
                                                {perm}
                                            </span>
                                        ))}
                                        {userPermissions.length > 5 && (
                                            <span className="text-xs text-gray-500 px-2 py-1">
                                                +{userPermissions.length - 5} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* No Permissions Message */}
                            {userPermissions.length === 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-600">
                                        You currently have no permissions assigned.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mt-8">
                    <button
                        onClick={() => router.back()}
                        className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Go Back
                    </button>
                    <Link
                        href="/dashboard"
                        className="block w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] text-center"
                    >
                        Go to Dashboard
                    </Link>
                </div>

                {/* Help Text */}
                <p className="mt-8 text-xs text-gray-500">
                    If you believe this is an error, please contact your administrator.
                </p>
            </div>
        </div>
    );
}

