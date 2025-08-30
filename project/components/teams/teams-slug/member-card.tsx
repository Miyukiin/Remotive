"use client";

import { FC, useEffect, useState } from "react";
import { Mail } from "lucide-react";

import type { UserSelect } from "@/types";
import MemberOptions from "./member-options";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getProjectsCountForMemberAction } from "@/actions/teams-actions";

type MemberCardProps = {
  member: UserSelect;
  team_id: number;
  teamLeaderData: UserSelect;
  isReassignLoading: boolean;
  setNewLeaderId: (val: number) => void;
};

const MemberCard: FC<MemberCardProps> = ({ member, team_id, teamLeaderData, isReassignLoading, setNewLeaderId }) => {
  const isLeader = member.id === teamLeaderData.id;
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    async function getProjectCount() {
      const projects = await getProjectsCountForMemberAction(member.id);
      if (!projects.success) throw new Error(projects.message ?? "Unable to retrieve project count");
      setProjectCount(projects.data.length);
    }

    getProjectCount().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      toast.error("Error", { description: message });
    });
  }, [member]);

  const projectCountText =
    projectCount === 0
      ? "No active projects"
      : projectCount === 1
        ? "1 active project"
        : `${projectCount} active projects`;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Avatar + Name + Role */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={member.image_url ?? undefined}
                alt={member.name ?? "User"}
                onLoad={(e) => e.currentTarget.classList.remove("opacity-0")}
                className="opacity-0 transition-opacity duration-200"
              />
              <AvatarFallback className="text-xs">
                {(member.name ?? "U")
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <CardTitle className="text-base leading-none">{member.name}</CardTitle>
              <CardDescription className="mt-0.5">{isLeader ? "Team Leader" : "Team Member"}</CardDescription>
            </div>
          </div>

          {/* Actions (hidden for not leader) */}
          {!isLeader && (
            <MemberOptions
              team_id={team_id}
              user_id={member.id}
              isReassignLoading={isReassignLoading}
              setNewLeaderId={setNewLeaderId}
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Email */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
          <span className="truncate">{member.email}</span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <Badge variant={isLeader ? "default" : "secondary"}>{isLeader ? "Leader" : "Active"}</Badge>
        <div className="text-sm text-muted-foreground">{projectCountText}</div>
      </CardFooter>
    </Card>
  );
};

const SkeletonMemberCard: FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="rounded-full" height="10" width="10" />
              <div className="space-y-2">
                <Skeleton height="4" width="32" />
                <Skeleton height="3" width="24" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton height="3" width="48" />
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <Skeleton className="rounded-full" height="6" width="16" />
            <Skeleton height="3" width="20" />
          </CardFooter>
        </Card>
      ))}
    </>
  );
};

export { SkeletonMemberCard };
export default MemberCard;
