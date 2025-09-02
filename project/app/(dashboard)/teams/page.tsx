"use client";
import CreateTeamButton from "@/components/teams/create-team-button";
import TeamsSection from "@/components/teams/teams-section";

import { useTeams } from "@/hooks/use-teams";
import CreateTeamModal from "@/components/modals/create-team-modal";
import { TeamsSectionSkeleton } from "@/components/teams/team-sections-skeleton";
import StateBlock from "@/components/ui/state-block";

export default function TeamPage() {
  const { userTeams, isUserTeamsLoading, getUserTeamsError } = useTeams({});

  return (
    <>
      <CreateTeamModal />
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Teams</h1>
            <p className="text-muted-foreground mt-2">
              Manage team members and permissions
            </p>
          </div>
          <CreateTeamButton />
        </div>

        <p className="text-xl font-bold text-foreground">Your Teams</p>

        {isUserTeamsLoading ? (
          <div className="min-h-60">
            <TeamsSectionSkeleton count={6} />
          </div>
        ) : getUserTeamsError ? (
          <StateBlock
            title="Unable to load your teams."
            description="Please refresh the page or try again later."
            actions={<CreateTeamButton />}
          />
        ) : (
          <TeamsSection teamsData={userTeams ?? []} />
        )}
      </div>
    </>
  );
}
