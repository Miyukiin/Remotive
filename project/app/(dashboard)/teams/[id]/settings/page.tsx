"use client";
import TeamSettings from "@/components/teams/teams-slug/team-settings";
import LoadingUI from "@/components/ui/loading-ui";
import { use, useEffect } from "react";
import { useTeams } from "@/hooks/use-teams";
import { DeleteTeamModal } from "@/components/modals/delete-team-modal";
import { useRouter } from "next/navigation";

export default function TeamSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // Unwrap the promise as per Nextjs 15 recommendation
  const teamId = Number(id);
  const { team, isTeamLoading, teamError, isTeamLeader } = useTeams({team_id: teamId});;
  const router = useRouter();

  // Redirect if not leader (only after loading finishes)
  useEffect(() => {
    if (!isTeamLoading && isTeamLeader === false) {
      router.replace("/teams");
    }
  }, [isTeamLoading, isTeamLeader, router]);

  if (isTeamLoading) {
    return <LoadingUI />;
  }

  if (teamError) {
    return (
      <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {teamError.message ?? "Unable to load team."}
      </p>
    );
  }
  if (!team) {
    return <p className="flex h-full items-center justify-center text-sm text-muted-foreground">Team not found.</p>;
  }

  if (isTeamLeader === false) {
    return (
      <p className="flex h-full items-center justify-center text-xl">
        You are not allowed to view this page. Redirecting…
      </p>
    );
  }

  return (
    <>
      <DeleteTeamModal team_id={teamId} />
      <div className="flex flex-col gap-12">
        <TeamSettings team={team} />
      </div>
    </>
  );
}
