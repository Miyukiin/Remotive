import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MemberCardSkeleton() {
  return (
    <Card className="transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Avatar + Name + Role */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" /> {/* name */}
              <Skeleton className="h-3 w-24" /> {/* role */}
            </div>
          </div>

          {/* Actions */}
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Email row */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3 w-48" />
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        {/* Badge */}
        <Skeleton className="h-6 w-20 rounded-full" />
        {/* Project count */}
        <Skeleton className="h-4 w-36" />
      </CardFooter>
    </Card>
  );
}
