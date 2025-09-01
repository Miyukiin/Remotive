import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
            <div className="h-4 w-56 rounded bg-muted animate-pulse" />
            {/* Description */}
            <div className="mt-2 space-y-2">
              <div className="h-3 w-5/6 rounded bg-muted/70 animate-pulse" />
              <div className="h-3 w-3/6 rounded bg-muted/50 animate-pulse" />
            </div>

            {/* Meta row */}
            <div className="mt-3 flex flex-col lg:flex-row justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
                  <div className="h-3 w-8 rounded bg-muted/70 animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
                  <div className="h-3 w-24 rounded bg-muted/70 animate-pulse" />
                </div>
              </div>
              <div className="h-5 w-28 rounded-full bg-muted/70 animate-pulse" />
            </div>

            {/* Assignees */}
            <div className="mt-3 flex -space-x-2">
              {[...Array(4)].map((__, j) => (
                <div
                  key={j}
                  className="h-6 w-6 rounded-full ring-2 ring-background bg-muted animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
