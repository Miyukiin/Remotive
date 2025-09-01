"use client";
import CreateTeamButton from "@/components/teams/create-team-button";
import TeamsSection from "@/components/teams/teams-section";

import { useTeams } from "@/hooks/use-teams";
import CreateTeamModal from "@/components/modals/create-team-modal";
import { TeamsSectionSkeleton } from "@/components/teams/team-sections-skeleton";

export default function TeamPage() {
  const { userTeams, isUserTeamsLoading, getUserTeamsError } = useTeams({});

  return (
    <>
      <CreateTeamModal />
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Teams</h1>
            <p className="text-muted-foreground mt-2">Manage team members and permissions</p>
          </div>
          <CreateTeamButton />
        </div>

        <p className="text-xl font-bold mb-4 text-foreground">Your Teams</p>

        {isUserTeamsLoading ? (
          <TeamsSectionSkeleton count={6} />
        ) : userTeams && userTeams.length > 0 ? (
          <TeamsSection teamsData={userTeams} />
        ) : getUserTeamsError ? (
          <div className="text-center text-sm text-muted-foreground">
            <p>Unable to load your teams. Please refresh the page.</p>
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            <p>You are not in any teams right now.</p>
            <p>Create or get invited to one!</p>
          </div>
        )}
      </div>
    </>
  );
}
