import { UserSelect } from "@/types";
import { FC } from "react";
import MemberCard from "./member-card";

type TeamMembersGridProps = {
  teamMembers: UserSelect[];
  isTeamLeader: boolean;
  teamLeaderUser: UserSelect;
  team_id: number;
  isReassignLoading: boolean,
  setNewLeaderId: (val: number) => void;
};

const TeamMembersGrid: FC<TeamMembersGridProps> = ({
  teamMembers,
  teamLeaderUser,
  isReassignLoading,
  team_id,
  setNewLeaderId,
}) => {
  return (
    <>
      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            team_id={team_id}
            teamLeaderData={teamLeaderUser}
            isReassignLoading={isReassignLoading}
            setNewLeaderId={setNewLeaderId}
          />
        ))}
      </div>
    </>
  );
};

export default TeamMembersGrid;
