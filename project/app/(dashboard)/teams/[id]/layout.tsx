"use client";
import TeamsHeading from "@/components/teams/teams-heading";
import LoadingUI from "@/components/ui/loading-ui";
import { useTeams } from "@/hooks/use-teams";
import { useParams } from "next/navigation";

export default function TeamsLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const teamId = Number(id);
  const { team, isTeamLoading, teamError } = useTeams({team_id: teamId});

  if (!team) {
    if (!team && isTeamLoading) {
      return <LoadingUI />;
    }
    throw new Error(teamError?.message);
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <TeamsHeading team={team} />
      {children}
    </div>
  );
}
