"use client";
import ReassignLeaderModal from "@/components/modals/reassign-leader-modal";
import LoadingUI from "@/components/ui/loading-ui";
import { useTeams } from "@/hooks/use-teams";
import { Loader2Icon } from "lucide-react";
import { use, useState } from "react";
import TeamMembersGrid from "@/components/teams/teams-slug/team-members-grid";
import { SkeletonMemberCard } from "@/components/teams/teams-slug/member-card";

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // Unwrap the promise as per Nextjs 15 recommendation
  const team_id = Number(id);
  const [newLeaderId, setNewLeaderId] = useState<number>(-1);

  // Retrieve team data and its members
  const {
    teamMembers,
    isTeamMembersLoading,
    teamMembersError,
    isTeamLoading,
    teamError,
    teamLeaderUser,
    isTeamLeaderUserLoading,
    teamLeaderUserError,
    isTeamLeader,
    isTeamLeaderCheckLoading,
    teamLeaderCheckError,
    reassignTeamLeader,
    isReassignTeamLeaderLoading,
  } = useTeams(team_id);

  // If error, throw error
  if (teamError || teamLeaderUserError || teamMembersError || teamLeaderCheckError) {
    throw new Error("Unable to retrieve team data.");
  }

  // If loading, display loading ui
  if (isTeamLoading || isTeamLeaderUserLoading || isTeamMembersLoading || isTeamLeaderCheckLoading) {
    return <LoadingUI />;
  }

  return (
    <>
      {teamLeaderUser && teamMembers && (
        <ReassignLeaderModal
          team_id={team_id}
          new_leader_id={newLeaderId}
          current_leader_id={teamLeaderUser.id}
          reAssignLeader={({ old_leader_id, new_leader_id, team_id }) =>
            reassignTeamLeader({ old_leader_id: old_leader_id, new_leader_id: new_leader_id, team_id: team_id })
          }
          isReassignLoading={isReassignTeamLeaderLoading}
        />
      )}
      <div className="space-y-6">
        {/* Team Members Grid */}
        {teamMembers && isTeamLeader !== undefined && !!teamLeaderUser ? (
          <TeamMembersGrid
            teamMembers={teamMembers}
            isTeamLeader={isTeamLeader}
            teamLeaderUser={teamLeaderUser}
            team_id={team_id}
            isReassignLoading={isReassignTeamLeaderLoading}
            setNewLeaderId={setNewLeaderId}
          />
        ) : (
          <>
            <SkeletonMemberCard />
            <div
              className={`flex w-full justify-center ${teamMembers ? "opacity-0" : "opacity-100"} transition-opacity duration-150 `}
            >
              <Loader2Icon className="animate-spin text-white-smoke-200" />
            </div>
          </>
        )}
      </div>
    </>
  );
}
