import React from "react";

export interface FormContainerProps {
    children: React.ReactNode;
    error?: string | null;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    className?: string;
}

export function FormContainer({
    children,
    error,
    onSubmit,
    className = "",
}: FormContainerProps) {
    return (
        <form onSubmit={onSubmit} className={`bg-white rounded-lg shadow p-6 space-y-6 ${className}`}>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}
            {children}
        </form>
    );
}
