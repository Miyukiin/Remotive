"use client";

import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import type { TeamsSelect } from "@/types";
import { useTeams } from "@/hooks/use-teams";
import MembersAvatars from "@/components/ui/members-avatars";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Folder, Users } from "lucide-react";
import { getProjectsForTeamAction } from "@/actions/teams-actions";
import { toast } from "sonner";
import TeamOptions from "./teams-options";

type TeamsCardProps = {
  teamData: TeamsSelect;
};

const TeamsCard: FC<TeamsCardProps> = ({ teamData }) => {
  const { teamMembers, isTeamMembersLoading, teamMembersError } = useTeams(teamData.id);
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    async function getProjectCount() {
      const projects = await getProjectsForTeamAction(teamData.id);
      if (!projects.success) throw new Error(projects.message ?? "Unable to retrieve project count");
      setProjectCount(projects.data.length);
    }

    getProjectCount().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      toast.error("Error", { description: message });
    });
  }, [teamData.id]);

  const membersText = isTeamMembersLoading
    ? "Loading…"
    : teamMembersError
      ? "Unable to load members"
      : `${teamMembers?.length} members`;

  const projectCountText =
    projectCount === 0
      ? "No active projects"
      : projectCount === 1
        ? "1 active project"
        : `${projectCount} active projects`;

  return (
    <Link href={`/teams/${teamData.id}`} className="group block" aria-label={`Open team ${teamData.teamName}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg md:text-xl line-clamp-1">{teamData.teamName}</CardTitle>
            <TeamOptions team_id={teamData.id} />
          </div>
          <CardDescription className="line-clamp-2">{teamData.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-1.5">
          <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" aria-hidden="true" />
              <span aria-live="polite">{membersText}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>{formatDate(teamData.createdAt)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4" aria-hidden="true" />
              <span aria-live="polite"> {projectCountText}</span>
            </div>

            <div>
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
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TeamsCard;
