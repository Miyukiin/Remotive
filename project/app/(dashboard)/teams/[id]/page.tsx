"use client";
import ReassignLeaderModal from "@/components/modals/reassign-leader-modal";
import { useTeams } from "@/hooks/use-teams";
import { use, useState } from "react";
import TeamMembersGrid from "@/components/teams/teams-slug/team-members-grid";
import { TeamMembersGridSkeleton } from "@/components/teams/teams-slug/team-members-grid-skeleton";

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const team_id = Number(id);
  const [newLeaderId, setNewLeaderId] = useState<number>(-1);

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
  } = useTeams({ team_id });

  if (teamError || teamLeaderUserError || teamMembersError || teamLeaderCheckError) {
    throw new Error("Unable to retrieve team data.");
  }

  const isLoading = isTeamLoading || isTeamLeaderUserLoading || isTeamMembersLoading || isTeamLeaderCheckLoading;

  return (
    <>
      {teamLeaderUser && teamMembers && (
        <ReassignLeaderModal
          team_id={team_id}
          new_leader_id={newLeaderId}
          current_leader_id={teamLeaderUser.id}
          reAssignLeader={({ old_leader_id, new_leader_id, team_id }) =>
            reassignTeamLeader({ old_leader_id, new_leader_id, team_id })
          }
          isReassignLoading={isReassignTeamLeaderLoading}
        />
      )}

      <div className="space-y-6">
        {/* Team Members Grid */}
        {isLoading || !teamMembers || !teamLeaderUser || isTeamLeader === undefined ? (
          <TeamMembersGridSkeleton count={6} />
        ) : (
          <TeamMembersGrid
            teamMembers={teamMembers}
            isTeamLeader={isTeamLeader}
            teamLeaderUser={teamLeaderUser}
            team_id={team_id}
            isReassignLoading={isReassignTeamLeaderLoading}
            setNewLeaderId={setNewLeaderId}
          />
        )}
      </div>
    </>
  );
}
