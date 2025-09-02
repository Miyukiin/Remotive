import { ProjectsSearchFilterSkeleton } from "@/components/projects/projects-search-filter-skeleton";
import { ProjectCardSkeleton } from "@/components/projects/project-card-skeleton";

export function ProjectsSectionSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div>
      <ProjectsSearchFilterSkeleton />
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
