import { Skeleton } from "@/components/ui/skeleton";

export const StatCardSkeleton = () => {
  return (
    <div className="glass-card rounded-2xl p-6 text-center space-y-3">
      {/* Icon */}
      <Skeleton className="w-10 h-10 rounded-full mx-auto" />
      
      {/* Value */}
      <Skeleton className="h-10 w-20 mx-auto" />
      
      {/* Label */}
      <Skeleton className="h-4 w-24 mx-auto" />
    </div>
  );
};
