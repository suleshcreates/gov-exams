import { Skeleton } from "@/components/ui/skeleton";

export const PerformanceChartSkeleton = () => {
  return (
    <div className="glass-card rounded-2xl p-8 space-y-6">
      {/* Title */}
      <Skeleton className="h-8 w-48" />
      
      {/* Chart items */}
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};
