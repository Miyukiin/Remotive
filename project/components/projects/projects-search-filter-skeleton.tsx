import { Skeleton } from "@/components/ui/skeleton";

export function ProjectsSearchFilterSkeleton() {
  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {/* Search input */}
      <div className="w-full">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      {/* Filter button / select */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-64 rounded-md" />
      </div>
    </div>
  );
}
