import { Skeleton } from "@/components/ui/skeleton";

export const PlanCardSkeleton = () => {
  return (
    <div className="glass-card rounded-2xl p-8 space-y-6">
      {/* Plan name */}
      <Skeleton className="h-8 w-32 mx-auto" />
      
      {/* Description */}
      <Skeleton className="h-4 w-full" />
      
      {/* Price */}
      <div className="flex items-center justify-center gap-2">
        <Skeleton className="h-12 w-24" />
      </div>
      
      {/* Features list */}
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      
      {/* Button */}
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
};
