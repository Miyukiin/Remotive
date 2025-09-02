import { Skeleton } from "@/components/ui/skeleton";

export function DashboardStatsSkeleton() {
  const cards = Array.from({ length: 4 });

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((_, i) => (
        <div key={i} className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center">
            {/* Icon box */}
            <div className="shrink-0">
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>

            {/* Text area */}
            <div className="ml-5 w-0 flex-1">
              <div className="space-y-2">
                {/* Title + (Last 7 days) */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-28 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>

                {/* Value + delta */}
                <div className="flex items-baseline gap-3">
                  <Skeleton className="h-7 w-16 rounded" />
                  <Skeleton className="h-3 w-10 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
