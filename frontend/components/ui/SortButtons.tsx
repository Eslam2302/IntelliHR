"use client";

interface SortOption<T extends string> {
    field: T;
    label: string;
    icon: string;
}

interface SortButtonsProps<T extends string> {
    options: SortOption<T>[];
    sortBy: T;
    sortOrder: "asc" | "desc";
    onSort: (field: T) => void;
    className?: string;
}

export function SortButtons<T extends string>({
    options,
    sortBy,
    sortOrder,
    onSort,
    className = "",
}: SortButtonsProps<T>) {
    const SortIcon = ({ field }: { field: T }) => {
        if (sortBy !== field) {
            return null;
        }

        return sortOrder === "asc" ? (
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>

        ) : (
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>

        );
    };

    return (
        <div className={`flex flex-wrap items-center gap-2 ${className}`}>
            <span className="text-sm font-medium text-gray-700 mr-2">Sort by:</span>
            {options.map((option) => (
                <button
                    key={option.field}
                    onClick={() => onSort(option.field)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${sortBy === option.field
                        ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300 shadow-sm"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                        }`}
                >
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                    {sortBy === option.field && <SortIcon field={option.field} />}
                </button>
            ))}
        </div>
    );
}
