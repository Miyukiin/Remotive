
import { Skeleton } from "@/components/ui/skeleton";

export function SearchBarSkeleton() {
  return <Skeleton className="h-10 w-full rounded-md" />;
}

export function ProjectHeadingSkeleton() {
  return <Skeleton className="h-24 w-full rounded-md" />;
}

export function BreadCrumbsSkeleton() {
  return <Skeleton className="h-6 w-[250px] rounded-md" />;
}

export function KanbanBoardSkeleton({
  columns = 4,
  cardsPerColumn = 3,
  height = 500,
}: {
  columns?: number;
  cardsPerColumn?: number;
  height?: number;
}) {
  return (
    <div className="scrollbar-custom flex gap-x-3 overflow-x-auto">
      <div className="flex gap-x-3 py-2">
        {Array.from({ length: columns }).map((_, colIdx) => (
          <div key={colIdx} className="min-w-[20rem] w-80 shrink-0">
            <div
              className="flex h-full flex-col rounded-lg border border-border bg-list-bg p-3"
              style={{ height }}
            >
              {/* Column header */}
              <div className="mb-3 flex items-center justify-between">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>

              {/* Cards */}
              <div className="space-y-3 overflow-y-auto">
                {Array.from({ length: cardsPerColumn }).map((_, cardIdx) => (
                  <div key={cardIdx} className="rounded-md border border-border bg-card p-3">
                    {/* Title */}
                    <Skeleton className="h-4 w-40" />
                    {/* Description */}
                    <div className="mt-2 space-y-2">
                      <Skeleton className="h-3 w-5/6" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    {/* Meta row */}
                    <div className="mt-3 flex items-center justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
