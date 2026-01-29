import { Skeleton } from "@/components/ui/skeleton";

export const ExamCardSkeleton = () => {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      {/* Icon placeholder */}
      <Skeleton className="w-16 h-16 rounded-full" />

      {/* Title */}
      <Skeleton className="h-8 w-3/4" />

      {/* Description */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>

      {/* Button */}
      <Skeleton className="h-12 w-full rounded-full" />
    </div>
  );
};
