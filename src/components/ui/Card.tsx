import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Card = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("bg-white border border-neutral-200 rounded-lg shadow-sm", className)} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("px-[var(--card-padding-x)] py-[var(--card-padding-y)] border-b border-neutral-200", className)}>
    {children}
  </div>
);

export const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("px-[var(--card-padding-x)] py-[var(--card-padding-y)]", className)}>
    {children}
  </div>
);
