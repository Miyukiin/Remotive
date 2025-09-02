import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RecentProjectsCardSkeleton() {
  const rows = Array.from({ length: 3 });

  return (
    <Card className="flex-1">
      <CardHeader>
        <div className="flex w-full items-center justify-between">
          <CardTitle>Recent Projects</CardTitle>
          <Skeleton className="h-4 w-16" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {rows.map((_, i) => (
          <div key={i} className="rounded-md border bg-card p-4">
            {/* Title */}
            <Skeleton className="h-4 w-48" />

            {/* Description */}
            <div className="mt-2 space-y-2">
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/6" />
            </div>

            {/* Meta row */}
            <div className="mt-3 flex flex-col lg:flex-row justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>

            {/* Progress */}
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
