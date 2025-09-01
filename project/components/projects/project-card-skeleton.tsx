import { Card, CardHeader, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectCardSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-6 w-40" />             {/* title */}
          <Skeleton className="h-6 w-6 rounded" />      {/* menu icon */}
        </div>
        <CardDescription>
          <Skeleton className="h-4 w-[70%]" />          {/* one-line description */}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* meta row (members / due date) */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>

        {/* progress label + bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-2 w-full rounded" />
        </div>

        {/* tasks + time left */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <Skeleton className="h-6 w-24 rounded-full" />  {/* status badge */}
        <div className="flex -space-x-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="ring-2 ring-background rounded-full">
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
