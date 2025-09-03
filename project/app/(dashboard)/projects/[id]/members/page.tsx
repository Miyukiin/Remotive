"use client";

import { use } from "react";
import { useProjectMembers, useProjects } from "@/hooks/use-projects";
import { useTeams } from "@/hooks/use-teams";
import { ProjectMembersDataTable } from "@/components/projects/members/data-table-project-members";
import { getProjectDataTableMemberColumns } from "@/components/projects/members/columns-data-table-project-members";
import ReassignManagerModal from "@/components/modals/reassign-manager-modal";
import { useProjectManagerStore } from "@/stores/project-manager-store";
import { useUIStore } from "@/stores/ui-store";
import { ProjectRoles } from "@/types";
import ReassignProjectTeamsModal from "@/components/modals/reassign-project-teams-modal";
import LoadingUINoHeader from "@/components/ui/loading-ui-no-header";

export default function ProjectMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const projectId = Number(id);

  const { project, isProjectLoading, projectError } = useProjects(projectId);
  const { userTeams, projectTeams } = useTeams({ project_id: projectId });

  const { projectMembersData, isProjectMembersDataLoading, updateProjectMember, isUpdateProjectMemberLoading } =
    useProjectMembers(projectId);

  const { setPendingProjectManager } = useProjectManagerStore();
  const { setReassignManagerModalOpen } = useUIStore();

  function changeRole(userId: number, nextRole: ProjectRoles) {
    updateProjectMember({ member_id: userId, role: nextRole });
  }

  // Current team ids of project
  const teamIds = projectTeams?.map((t) => t.id);

  if (!project) {
    if (isProjectLoading) return <LoadingUINoHeader />;
    throw new Error(projectError?.message);
  }
  if (isProjectMembersDataLoading) return <LoadingUINoHeader />;

  const columns = getProjectDataTableMemberColumns(
    isUpdateProjectMemberLoading,
    setPendingProjectManager,
    setReassignManagerModalOpen,
    changeRole,
  );

  return (
    <div>
      {projectMembersData && projectTeams && userTeams && teamIds && (
        <>
          <ReassignProjectTeamsModal project_id={projectId} allTeams={userTeams} currentTeamIds={teamIds} />
          <ReassignManagerModal isLoading={isUpdateProjectMemberLoading} onRoleChange={changeRole} />
          <ProjectMembersDataTable columns={columns} data={projectMembersData} teamOptions={projectTeams} />
        </>
      )}
    </div>
  );
}
