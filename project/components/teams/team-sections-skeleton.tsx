import { TeamsSearchFilterSkeleton } from "@/components/teams/teams-search-filter-skeleton";
import { TeamCardSkeleton } from "@/components/teams/team-card-skeleton";

export function TeamsSectionSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div>
      <TeamsSearchFilterSkeleton />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <TeamCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
