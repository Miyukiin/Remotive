"use client";
import { formatDate } from "@/lib/utils";
import { TeamsSelect } from "@/types";
import { FC } from "react";
import MembersAvatars from "../ui/members-avatars";
import { useTeams } from "@/hooks/use-teams";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

type TeamsCardProps = {
  teamData: TeamsSelect;
};

const TeamsCard: FC<TeamsCardProps> = ({ teamData }) => {
  const { teamMembers, isTeamMembersLoading, teamMembersError } = useTeams(teamData.id);

  return (
    <Link href={`/teams/${teamData.id}`}>
      <div className=" bg-card rounded-lg border border-border shadow hover:shadow-md p-4">
        {/* Team Information */}
        <h3 className="text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{teamData.teamName}</h3>
        <p className="text-xs text-muted-foreground">
          Active Projects: 4{" "}
          {/* Once Projects is finished. Execute appropriate server action and insert here the result. */}
        </p>
        <p className="text-xs text-muted-foreground">Created: {formatDate(teamData.createdAt)}</p>

        {/* Member Avatars */}
        <div className="mt-4">
          {isTeamMembersLoading ? (
            <Skeleton height="5" width="24" />
          ) : teamMembers && !teamMembersError ? (
            teamMembers.length === 0 ? (
              <p className="text-xs text-foreground/65">None Assigned</p>
            ) : (
              <MembersAvatars members={teamMembers} max_visible={5} size={5} />
            )
          ) : (
            <p className="text-xs text-foreground/65">Unable to load members.</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default TeamsCard;
