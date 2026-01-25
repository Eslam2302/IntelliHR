"use client";

interface TableSortIconProps {
  isActive: boolean;
  sortOrder?: "asc" | "desc";
  className?: string;
}

export function TableSortIcon({
  isActive,
  sortOrder,
  className = "",
}: TableSortIconProps) {
  if (!isActive) {
    return (
      <svg
        className={`w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${className}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
    );
  }

  return sortOrder === "asc" ? (
    <svg
      className={`w-4 h-4 text-indigo-600 ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 15l7-7 7 7"
      />
    </svg>
  ) : (
    <svg
      className={`w-4 h-4 text-indigo-600 ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}
