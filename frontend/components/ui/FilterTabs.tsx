"use client";

interface FilterTabsProps {
    value: "without" | "only" | "with";
    onChange: (value: "without" | "only" | "with") => void;
    labels?: {
        without?: string;
        only?: string;
        with?: string;
    };
    className?: string;
}

export function FilterTabs({
    value,
    onChange,
    labels = {
        without: "Active",
        only: "Deleted",
        with: "All",
    },
    className = "",
}: FilterTabsProps) {
    return (
        <div className={`inline-flex items-center gap-1 bg-gray-100 p-1 rounded-lg ${className}`}>
            <button
                onClick={() => onChange("without")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${value === "without"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>

                {labels.without}
            </button>
            <button
                onClick={() => onChange("only")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${value === "only"
                    ? "bg-white text-red-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>

                {labels.only}
            </button>
            <button
                onClick={() => onChange("with")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${value === "with"
                    ? "bg-white text-gray-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>

                {labels.with}
            </button>
        </div>
    );
}
