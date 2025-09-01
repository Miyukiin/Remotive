import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RecentTasksCardSkeleton() {
  const rows = Array.from({ length: 4 });

  return (
    <Card className="flex-1">
      <CardHeader>
        <div className="flex w-full items-center justify-between">
          <CardTitle>Recent Tasks</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {rows.map((_, i) => (
          <div key={i} className="rounded-md border bg-card p-4">
            {/* Title */}
            <Skeleton className="h-4 w-56" />

            {/* Description */}
            <div className="mt-2 space-y-2">
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-1/2" />
            </div>

            {/* Meta row */}
            <div className="mt-3 flex flex-col lg:flex-row justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>

            {/* Assignees */}
            <div className="mt-3 flex -space-x-2">
              {[...Array(4)].map((__, j) => (
                <div key={j} className="ring-2 ring-background rounded-full">
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
