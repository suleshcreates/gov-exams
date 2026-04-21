import { Skeleton } from "@/components/ui/skeleton";

export const HistoryCardSkeleton = () => {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div className="flex-1 w-full space-y-3">
          {/* Title */}
          <Skeleton className="h-6 w-48" />
          
          {/* Meta info */}
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        
        <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8">
          {/* Score */}
          <div className="text-center space-y-2">
            <Skeleton className="h-4 w-12 mx-auto" />
            <Skeleton className="h-8 w-16 mx-auto" />
          </div>
          
          {/* Accuracy */}
          <div className="text-center space-y-2">
            <Skeleton className="h-4 w-16 mx-auto" />
            <Skeleton className="h-8 w-16 mx-auto" />
          </div>
          
          {/* Button */}
          <Skeleton className="h-10 w-20 rounded-full" />
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="pt-4 border-t border-border/50">
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  );
};
