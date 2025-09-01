"use client";

import Link from "next/link";
import { FC, useMemo } from "react";
import { Calendar, Users } from "lucide-react";

import { useProjectMembers, useProjects } from "@/hooks/use-projects";
import { formatDate } from "@/lib/utils";
import { calculateOverdueInfo, cn } from "@/lib/utils";
import { projectStatusColor } from "@/lib/utils"; // keeps your existing status color map
import type { ProjectSelect } from "@/types";

import ProjectOptions from "./project-options";
import MembersAvatars from "../ui/members-avatars";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useProjectProgress } from "@/hooks/use-project-progress";

interface ProjectCardProps {
  project: ProjectSelect;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  const { projectMembers, isProjectMembersLoading, projectMembersError } = useProjectMembers(project.id);
  const { taskCount, isTaskCountLoading, taskCountError } = useProjects(project.id);
  const { data: prog, isLoading: isProgressLoading, isError: isProgressError } = useProjectProgress(project.id);

  const overdueInfo = useMemo(() => {
    const due = project.dueDate ? new Date(project.dueDate) : null;
    return calculateOverdueInfo(due);
  }, [project.dueDate]);

  const progress =
    typeof prog?.percent === "number"
      ? prog.percent
      : "progress" in project && typeof project.progress === "number"
        ? Math.min(100, Math.max(0, project.progress))
        : 0;

  const membersText = isProjectMembersLoading
    ? "Loading…"
    : projectMembersError
      ? "Unable to load members"
      : projectMembers
        ? `${projectMembers.length === 0 ? "No" : projectMembers.length} members`
        : "No members";

  const tasksText = isTaskCountLoading
    ? "Loading…"
    : taskCountError && taskCount == null
      ? "Unable to load task count"
      : `${taskCount === 0 ? "No" : taskCount} tasks`;

  const taskOverdueText = overdueInfo.isDueToday
    ? "Due Today"
    : overdueInfo.isOverdue
      ? `${Math.abs(overdueInfo.daysOverdue)} day${Math.abs(overdueInfo.daysOverdue) === 1 ? "" : "s"} overdue`
      : `${overdueInfo.daysLeft} day${overdueInfo.daysLeft === 1 ? "" : "s"} left`;

  return (
    <Link href={`/projects/${project.id}`} className="block group">
      <Card className="transition-all hover:shadow-lg hover:ring-1 hover:ring-border">
        <CardHeader className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg md:text-xl line-clamp-1">{project.name}</CardTitle>
            <ProjectOptions project_id={project.id} />
          </div>
          {project.description ? (
            <CardDescription className="line-clamp-2">{project.description}</CardDescription>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Meta row */}
          <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" aria-hidden="true" />
              <span aria-live="polite">{membersText}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>{project.dueDate ? formatDate(project.dueDate) : "No deadline set"}</span>
            </div>
          </div>

          <Separator />

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              {isProgressLoading ? (
                <Skeleton height="4" width="10" />
              ) : (
                <span className="font-medium">{progress}%</span>
              )}
            </div>
            {isProgressLoading ? (
              <Skeleton height="2" width="full" className=" rounded" />
            ) : (
              <Progress value={progress} />
            )}
            {isProgressError ? <span className="text-xs text-muted-foreground">Unable to load progress</span> : null}
          </div>

          {/* Tasks + Days Left */}
          <div className={`flex items-center justify-between text-sm  text-muted-foreground}`}>
            <span aria-live="polite">{tasksText}</span>
            <span className={`${overdueInfo.isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
              {taskOverdueText}
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={cn(
              "capitalize",

              projectStatusColor[project.status],
            )}
          >
            {String(project.status).replace(/[_-]/g, " ")}
          </Badge>

          {isProjectMembersLoading ? (
            <Skeleton height="6" width="20" />
          ) : projectMembers && !projectMembersError ? (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <MembersAvatars members={projectMembers} max_visible={5} size={6} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Project members</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span className="text-xs text-muted-foreground">Unable to load members</span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProjectCard;
