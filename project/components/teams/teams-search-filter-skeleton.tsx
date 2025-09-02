import { Skeleton } from "@/components/ui/skeleton";

export function TeamsSearchFilterSkeleton() {
  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {/* Search input */}
      <div className="w-full md:max-w-xl">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      {/* Filter select/button */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>
    </div>
  );
}
