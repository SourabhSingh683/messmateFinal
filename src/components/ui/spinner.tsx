
import * as React from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function Spinner({ className, size = 'md', color, ...props }: SpinnerProps) {
  const sizeClass = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  }[size];

  const colorClass = color || 'text-[#8B4513] dark:text-[#F7EFE1]';

  return (
    <div
      className={cn(
        `animate-spin rounded-full border-current border-t-transparent ${sizeClass} ${colorClass}`,
        className
      )}
      {...props}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
