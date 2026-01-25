import React from "react";
import { useRouter } from "next/navigation";

export interface ActionButtonsProps {
    submitLabel?: string;
    cancelLabel?: string;
    isSubmitting?: boolean;
    onCancel?: () => void;
    showCancel?: boolean;
    className?: string;
}

export function ActionButtons({
    submitLabel = "Submit",
    cancelLabel = "Cancel",
    isSubmitting = false,
    onCancel,
    showCancel = true,
    className = "",
}: ActionButtonsProps) {
    const router = useRouter();

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            router.back();
        }
    };

    return (
        <div className={`flex items-center justify-end gap-3 pt-4 border-t border-gray-200 ${className}`}>
            {showCancel && (
                <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                >
                    {cancelLabel}
                </button>
            )}
            <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
            >
                {isSubmitting ? "Saving..." : submitLabel}
            </button>
        </div>
    );
}
