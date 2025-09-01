"use client";

import { use } from "react";
import LoadingUI from "@/components/ui/loading-ui";
import { useProjectMembers, useProjects } from "@/hooks/use-projects";
import { useTeams } from "@/hooks/use-teams";
import { ProjectMembersDataTable } from "@/components/projects/members/data-table-project-members";
import { getProjectDataTableMemberColumns } from "@/components/projects/members/columns-data-table-project-members";

export default function ProjectMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // Next.js 15
  const projectId = Number(id);

  const { project, isProjectLoading, projectError } = useProjects(projectId);
  const { projectTeams } = useTeams({ project_id: projectId });
  const { projectMembersData, isProjectMembersDataLoading, projectMembersDataError } = useProjectMembers(projectId);

  if (!project) {
    if (isProjectLoading) return <LoadingUI />;
    throw new Error(projectError?.message);
  }

  if (isProjectMembersDataLoading) return <LoadingUI />;
  if (projectMembersDataError) throw projectMembersDataError;

  return (
    <div>
      {projectMembersData && projectTeams && (
        <ProjectMembersDataTable
          columns={getProjectDataTableMemberColumns()}
          data={projectMembersData}
          teamOptions={projectTeams}
        />
      )}
    </div>
  );
}
