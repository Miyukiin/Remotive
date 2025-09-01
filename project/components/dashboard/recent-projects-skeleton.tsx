import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RecentProjectsCardSkeleton() {
  const rows = Array.from({ length: 3 });

  return (
    <Card className="flex-1">
      <CardHeader>
        <div className="flex w-full items-center justify-between">
          <CardTitle>Recent Projects</CardTitle>
          <div className="h-4 w-16 rounded bg-muted animate-pulse" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {rows.map((_, i) => (
          <div key={i} className="rounded-md border bg-card p-4">
            {/* Title */}
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
            {/* Description */}
            <div className="mt-2 space-y-2">
              <div className="h-3 w-5/6 rounded bg-muted/70 animate-pulse" />
              <div className="h-3 w-4/6 rounded bg-muted/50 animate-pulse" />
            </div>

            {/* Meta row */}
            <div className="mt-3 flex flex-col lg:flex-row justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
                  <div className="h-3 w-10 rounded bg-muted/70 animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
                  <div className="h-3 w-24 rounded bg-muted/70 animate-pulse" />
                </div>
              </div>
              <div className="h-5 w-24 rounded-full bg-muted/70 animate-pulse" />
            </div>

            {/* Progress */}
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="h-3 w-16 rounded bg-muted/70 animate-pulse" />
                <div className="h-3 w-8 rounded bg-muted/70 animate-pulse" />
              </div>
              <div className="h-2 w-full rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
