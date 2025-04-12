
import React from "react";

export const Spinner = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full ${className}`} />
  );
};
