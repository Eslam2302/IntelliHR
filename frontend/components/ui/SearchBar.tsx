"use client";

import { useEffect, useState } from "react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
    onDebouncedChange?: (value: string) => void;
    className?: string;
}

export function SearchBar({
    value,
    onChange,
    placeholder = "Search...",
    debounceMs = 1000,
    onDebouncedChange,
    className = "",
}: SearchBarProps) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
            onDebouncedChange?.(value);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [value, debounceMs, onDebouncedChange]);

    return (
        <div className={`relative ${className}`}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>

            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white text-gray-900 placeholder:text-gray-500"
            />
            {value && (
                <button
                    onClick={() => onChange("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    type="button"
                >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>

                </button>
            )}
        </div>
    );
}
