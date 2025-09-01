export function DashboardStatsSkeleton() {
  const cards = Array.from({ length: 4 });

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((_, i) => (
        <div key={i} className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center">
            {/* Icon box */}
            <div className="shrink-0">
              <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
            </div>

            {/* Text area */}
            <div className="ml-5 w-0 flex-1">
              <div className="space-y-2">
                {/* Title + (Last 7 days) */}
                <div className="flex items-center gap-2">
                  <div className="h-3 w-28 bg-muted/70 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-muted/40 rounded animate-pulse" />
                </div>

                {/* Value + delta */}
                <div className="flex gap-3">
                  <div className="h-7 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-10 bg-muted/60 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
