import React from 'react';

export const Skeleton = ({ className, variant = 'default' }) => {
  const baseClasses = 'animate-pulse rounded';
  const variantClasses = {
    default: 'bg-gray-200 dark:bg-gray-700',
    text: 'h-4 w-3/4',
    title: 'h-6 w-1/2',
    card: 'h-32 w-full',
    avatar: 'h-10 w-10 rounded-full',
    button: 'h-10 w-24',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.default} ${className || ''}`}
      style={{ background: 'var(--surface-2)' }}
    />
  );
};

export const CardSkeleton = () => (
  <div className="rounded-xl p-4 animate-pulse" style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', minHeight: 120 }}>
    <Skeleton className="h-3 w-24 mb-3" variant="text" />
    <div className="flex justify-between items-center gap-4">
      <Skeleton className="h-4 w-28" variant="text" />
      <Skeleton className="h-6 w-12" variant="text" />
      <Skeleton className="h-4 w-28" variant="text" />
    </div>
  </div>
);

export const StatsCardSkeleton = () => (
  <div className="p-4 rounded-lg animate-pulse" style={{ background: 'var(--surface-0)', border: '1px solid var(--border)' }}>
    <Skeleton className="h-3 w-20 mb-2" variant="text" />
    <Skeleton className="h-8 w-16" variant="title" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="p-4 rounded-lg animate-pulse" style={{ background: 'var(--surface-0)', border: '1px solid var(--border)' }}>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-10" variant="avatar" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" variant="text" />
            <Skeleton className="h-3 w-1/2" variant="text" />
          </div>
        </div>
      </div>
    ))}
  </div>
);
