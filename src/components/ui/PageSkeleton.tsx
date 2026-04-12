import React from 'react';

function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-muted ${className || ''}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

const PageSkeleton = React.memo(function PageSkeleton() {
  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <ShimmerBlock className="h-8 w-48" />
          <ShimmerBlock className="h-4 w-72" />
        </div>
        <ShimmerBlock className="h-10 w-32 rounded-xl" />
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ShimmerBlock key={i} className="h-28" />
        ))}
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <ShimmerBlock className="h-64" />
        </div>
        <div className="space-y-4">
          <ShimmerBlock className="h-64" />
        </div>
      </div>
    </div>
  );
});

export default PageSkeleton;
