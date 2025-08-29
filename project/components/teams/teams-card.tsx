"use client";

import Link from "next/link";
import { FC } from "react";
import { formatDate } from "@/lib/utils";
import type { TeamsSelect } from "@/types";
import { useTeams } from "@/hooks/use-teams";
import MembersAvatars from "@/components/ui/members-avatars";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type TeamsCardProps = {
  teamData: TeamsSelect;
};

const TeamsCard: FC<TeamsCardProps> = ({ teamData }) => {
  const { teamMembers, isTeamMembersLoading, teamMembersError } = useTeams(teamData.id);

  return (
    <Link
      href={`/teams/${teamData.id}`}
      className="group block"
      aria-label={`Open team ${teamData.teamName}`}
    >
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="truncate text-lg">{teamData.teamName}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-1.5">
          <p className="text-xs text-muted-foreground">
            Active Projects: 4 {/* TODO: replace with real count */}
          </p>
          <p className="text-xs text-muted-foreground">
            Created: {formatDate(teamData.createdAt)}
          </p>

          <div className="pt-3">
            {isTeamMembersLoading ? (
              <div className="flex items-center gap-2">
                <Skeleton className="rounded-full" height="6" width="6" />
                <Skeleton className="rounded-full" height="6" width="6" />
                <Skeleton className="rounded-full" height="6" width="6" />
                <Skeleton className="rounded-md" height="5" width="20" />
              </div>
            ) : teamMembers && !teamMembersError ? (
              teamMembers.length === 0 ? (
                <p className="text-xs text-muted-foreground">None assigned</p>
              ) : (
                <MembersAvatars members={teamMembers} max_visible={5} size={5} />
              )
            ) : (
              <p className="text-xs text-muted-foreground">Unable to load members.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TeamsCard;
