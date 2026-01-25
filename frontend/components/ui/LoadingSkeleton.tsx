"use client";

interface LoadingSkeletonProps {
    rows?: number;
    columns?: number;
    className?: string;
}

export function LoadingSkeleton({
    rows = 5,
    columns = 3,
    className = "",
}: LoadingSkeletonProps) {
    return (
        <div className={`p-12 ${className}`}>
            <div className="space-y-4">
                {[...Array(rows)].map((_, i) => (
                    <div key={i} className="animate-pulse flex space-x-4">
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
