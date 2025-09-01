import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TeamCardSkeleton() {
  return (
    <Card className="transition-shadow">
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="sr-only">Team</CardTitle>
          {/* Team name */}
          <Skeleton className="h-6 w-40" />
          {/* Options */}
          <Skeleton className="h-6 w-6 rounded" />
        </div>
        {/* Description (line-clamp-2 equivalent) */}
        <CardDescription>
          <div className="space-y-2">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-1.5">
        {/* members / created date */}
        <div className="flex flex-col gap-2 text-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        {/* project count / avatars */}
        <div className="flex flex-col gap-2 text-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Avatars */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="ring-2 ring-background rounded-full">
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
