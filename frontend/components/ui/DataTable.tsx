"use client";

import { ReactNode } from "react";

export interface Column<T> {
    key: string;
    header: string;
    render: (item: T) => ReactNode;
    sortable?: boolean;
    onSort?: () => void;
    sortIcon?: ReactNode;
    className?: string;
    headerClassName?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    emptyMessage?: string;
    emptyAction?: ReactNode;
    rowKey: (item: T) => string | number;
    onRowClick?: (item: T) => void;
    striped?: boolean;
    className?: string;
}

export function DataTable<T>({
    data,
    columns,
    isLoading = false,
    emptyMessage,
    emptyAction,
    rowKey,
    onRowClick,
    striped = true,
    className = "",
}: DataTableProps<T>) {
    if (isLoading) {
        return null;
    }

    if (data.length === 0) {
        return null;
    }

    return (
        <div className={`overflow-x-auto bg-white ${className}`}>
            <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                scope="col"
                                className={`px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${column.sortable
                                    ? "cursor-pointer hover:bg-gray-100 transition-colors group"
                                    : ""
                                    } ${column.headerClassName || ""}`}
                                onClick={column.sortable ? column.onSort : undefined}
                            >
                                <div className="flex items-center gap-2">
                                    <span>{column.header}</span>
                                    {column.sortable && column.sortIcon}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item, index) => {
                        const key = rowKey(item);
                        const uniqueKey = key !== undefined && key !== null
                            ? `${key}-${index}`
                            : `row-${index}`;
                        return (
                            <tr
                                key={uniqueKey}
                                onClick={() => onRowClick?.(item)}
                                className={`hover:bg-indigo-50/50 transition-colors ${onRowClick ? "cursor-pointer" : ""
                                    } ${striped && index % 2 === 0 ? "bg-white" : striped ? "bg-gray-50/30" : ""
                                    }`}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={`px-6 py-4 ${column.className || ""}`}
                                    >
                                        {column.render(item)}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
