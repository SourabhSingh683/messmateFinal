
import * as React from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
  variant?: 'default' | 'coffee';
}

export function Spinner({ 
  className, 
  size = 'md', 
  color, 
  variant = 'coffee',
  ...props 
}: SpinnerProps) {
  const sizeClass = {
    xs: 'h-3 w-3 border',
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  }[size];

  const variantClass = {
    default: 'text-primary dark:text-primary',
    coffee: 'text-[#8B4513] dark:text-[#D2B48C]'
  }[variant];

  const colorClass = color || variantClass;

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
