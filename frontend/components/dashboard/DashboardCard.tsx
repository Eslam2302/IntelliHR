"use client";

import Link from "next/link";
import { ReactNode } from "react";

export type DashboardCardVariant =
  | "teal"
  | "blue"
  | "violet"
  | "amber"
  | "emerald"
  | "orange"
  | "rose"
  | "sky"
  | "slate"
  | "indigo";

const VARIANT_STYLES: Record<
  DashboardCardVariant,
  {
    accent: string;
    bg: string;
    icon: string;
    link: string;
    linkHover: string;
    border: string;
  }
> = {
  teal: {
    accent: "bg-teal-500",
    bg: "bg-teal-50/80",
    icon: "text-teal-600",
    link: "text-teal-700",
    linkHover: "hover:text-teal-800 hover:bg-teal-100",
    border: "border-l-teal-500",
  },
  blue: {
    accent: "bg-blue-500",
    bg: "bg-blue-50/80",
    icon: "text-blue-600",
    link: "text-blue-700",
    linkHover: "hover:text-blue-800 hover:bg-blue-100",
    border: "border-l-blue-500",
  },
  violet: {
    accent: "bg-violet-500",
    bg: "bg-violet-50/80",
    icon: "text-violet-600",
    link: "text-violet-700",
    linkHover: "hover:text-violet-800 hover:bg-violet-100",
    border: "border-l-violet-500",
  },
  amber: {
    accent: "bg-amber-500",
    bg: "bg-amber-50/80",
    icon: "text-amber-600",
    link: "text-amber-700",
    linkHover: "hover:text-amber-800 hover:bg-amber-100",
    border: "border-l-amber-500",
  },
  emerald: {
    accent: "bg-emerald-500",
    bg: "bg-emerald-50/80",
    icon: "text-emerald-600",
    link: "text-emerald-700",
    linkHover: "hover:text-emerald-800 hover:bg-emerald-100",
    border: "border-l-emerald-500",
  },
  orange: {
    accent: "bg-orange-500",
    bg: "bg-orange-50/80",
    icon: "text-orange-600",
    link: "text-orange-700",
    linkHover: "hover:text-orange-800 hover:bg-orange-100",
    border: "border-l-orange-500",
  },
  rose: {
    accent: "bg-rose-500",
    bg: "bg-rose-50/80",
    icon: "text-rose-600",
    link: "text-rose-700",
    linkHover: "hover:text-rose-800 hover:bg-rose-100",
    border: "border-l-rose-500",
  },
  sky: {
    accent: "bg-sky-500",
    bg: "bg-sky-50/80",
    icon: "text-sky-600",
    link: "text-sky-700",
    linkHover: "hover:text-sky-800 hover:bg-sky-100",
    border: "border-l-sky-500",
  },
  slate: {
    accent: "bg-slate-500",
    bg: "bg-slate-50/80",
    icon: "text-slate-600",
    link: "text-slate-700",
    linkHover: "hover:text-slate-800 hover:bg-slate-100",
    border: "border-l-slate-500",
  },
  indigo: {
    accent: "bg-indigo-500",
    bg: "bg-indigo-50/80",
    icon: "text-indigo-600",
    link: "text-indigo-700",
    linkHover: "hover:text-indigo-800 hover:bg-indigo-100",
    border: "border-l-indigo-500",
  },
};

interface DashboardCardProps {
  title: string;
  description?: ReactNode;
  href?: string;
  linkLabel?: string;
  children?: ReactNode;
  className?: string;
  variant?: DashboardCardVariant;
  icon?: ReactNode;
}

/**
 * Reusable dashboard widget card with optional color variant and icon.
 * When children contain links, only the "View all" line is a link to avoid nested links.
 */
export function DashboardCard({
  title,
  description,
  href,
  linkLabel = "View all",
  children,
  className = "",
  variant = "slate",
  icon,
}: DashboardCardProps) {
  const hasChildContent = children != null;
  const wrapEntireCardInLink = href && !hasChildContent;
  const styles = VARIANT_STYLES[variant];

  const content = (
    <div
      className={`rounded-xl border border-gray-200/80 bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-gray-300 border-l-4 ${styles.border} ${className}`}
    >
      <div className="p-5">
        <div className="flex items-start gap-3">
          {icon && (
            <span className={`flex-shrink-0 rounded-lg p-2 ${styles.bg} ${styles.icon}`}>
              {icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            {description != null && (
              <div className="mt-1.5 text-sm text-gray-600">{description}</div>
            )}
            {children != null && <div className="mt-3">{children}</div>}
            {href && (
              <p className="mt-3">
                {wrapEntireCardInLink ? (
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium ${styles.link} ${styles.bg} ${styles.linkHover} transition-colors`}>
                    {linkLabel}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                ) : (
                  <Link
                    href={href}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium ${styles.link} ${styles.bg} ${styles.linkHover} transition-colors -ml-2`}
                  >
                    {linkLabel}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (wrapEntireCardInLink) {
    return (
      <Link
        href={href}
        className="block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-xl"
      >
        {content}
      </Link>
    );
  }

  return content;
}
