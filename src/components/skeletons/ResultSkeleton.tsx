import { Skeleton } from "@/components/ui/skeleton";
import { StatCardSkeleton } from "./StatCardSkeleton";

export const ResultSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 sm:space-y-6">
        <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto" />
        <Skeleton className="h-10 sm:h-12 w-64 sm:w-96 mx-auto" />
        <Skeleton className="h-5 sm:h-6 w-48 sm:w-64 mx-auto" />
      </div>
      
      {/* Score circle */}
      <div className="glass-card rounded-3xl p-6 sm:p-12">
        <Skeleton className="w-48 h-48 sm:w-64 sm:h-64 rounded-full mx-auto" />
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Skeleton className="h-12 sm:h-14 w-full sm:w-48 rounded-full" />
        <Skeleton className="h-12 sm:h-14 w-full sm:w-48 rounded-full" />
      </div>
    </div>
  );
};
