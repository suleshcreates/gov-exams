import { Skeleton } from "@/components/ui/skeleton";

export const ProfileHeaderSkeleton = () => {
  return (
    <div className="glass-card rounded-3xl p-8 neon-border">
      <div className="flex flex-wrap gap-8 items-center">
        {/* Avatar */}
        <Skeleton className="w-32 h-32 rounded-full" />
        
        <div className="flex-1 space-y-4">
          {/* Name */}
          <Skeleton className="h-10 w-64" />
          
          {/* Meta info */}
          <div className="flex gap-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        
        {/* Rank badge */}
        <div className="text-center space-y-3">
          <Skeleton className="w-20 h-20 rounded-full mx-auto" />
          <Skeleton className="h-8 w-16 mx-auto" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      </div>
    </div>
  );
};
