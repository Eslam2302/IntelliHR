import React from "react";

export interface FormFieldProps {
    label: string;
    name: string;
    type?: "text" | "email" | "password" | "number" | "textarea" | "select" | "date" | "time" | "tel" | "datetime-local" | "checkbox";
    value: string | number | boolean;
    checked?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
    rows?: number;
    options?: { value: string | number; label: string }[];
    className?: string;
    min?: number;
    max?: number;
}

export function FormField({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    required = false,
    error,
    disabled = false,
    rows = 4,
    options,
    className = "",
    min,
    max,
    checked,
}: FormFieldProps) {
    const baseInputClasses = "w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed";
    const errorClasses = error ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "";

    const renderInput = () => {
        switch (type) {
            case "textarea":
                return (
                    <textarea
                        id={name}
                        name={name}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        required={required}
                        disabled={disabled}
                        rows={rows}
                        className={`${baseInputClasses} ${errorClasses} ${className}`}
                    />
                );

            case "checkbox":
                return (
                    <input
                        type="checkbox"
                        id={name}
                        name={name}
                        checked={checked ?? Boolean(value)}
                        onChange={onChange}
                        disabled={disabled}
                        className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${errorClasses} ${className}`}
                    />
                );

            case "select":
                return (
                    <select
                        id={name}
                        name={name}
                        value={value}
                        onChange={onChange}
                        required={required}
                        disabled={disabled}
                        className={`${baseInputClasses} ${errorClasses} ${className}`}
                    >
                        <option value="">Select {label}</option>
                        {options?.map((option, index) => (
                            <option key={`${name}-opt-${index}-${option.value ?? ""}`} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            default:
                return (
                    <input
                        type={type}
                        id={name}
                        name={name}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        required={required}
                        disabled={disabled}
                        min={min}
                        max={max}
                        className={`${baseInputClasses} ${errorClasses} ${className}`}
                    />
                );
        }
    };

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {renderInput()}
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}
