"use client";
import { use } from "react";
import { useProjects } from "@/hooks/use-projects";
import LoadingUI from "@/components/ui/loading-ui";
import { useTeams } from "@/hooks/use-teams";
import { useUsers } from "@/hooks/use-users";
import {
  getProjectDataTableMemberColumns,
  ProjectMember,
} from "@/components/projects/members/columns-data-table-project-members";
import { ProjectMembersDataTable } from "@/components/projects/members/data-table-project-members";
import { TeamsSelect } from "@/types";

export default function ProjectMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // Unwrap the promise as per Nextjs 15 recommendation
  const projectId = Number(id);
  const { project, isProjectLoading, projectError } = useProjects(projectId);
  const { projectTeams } = useTeams({ project_id: projectId });
  const { users } = useUsers(); // Replace this with a call that gets a project's team members enclosed within team team: {...teamMembers}

  const example: ProjectMember[] = [
    {
      user: {
        id: 1,
        clerkId: "das",
        email: "john@example.com",
        name: "John Doe",
        image_url: "das",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      teams: [
        {
          id: 15,
          teamName: "King",
          description: "dasdsa",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 16,
          teamName: "Elephants",
          description: "dasdsa",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      roles: "No Role Yet",
    },
  ];

  const teamExample: TeamsSelect[] = [
    {
      id: 1,
      description: "Instigating",
      createdAt: new Date(),
      updatedAt: new Date(),
      teamName: "Teamers",
    },
  ];

  if (!project) {
    if (!project && isProjectLoading) {
      return <LoadingUI />;
    }
    throw new Error(projectError?.message);
  }

  return (
    <div>
      {users && projectTeams && (
        <ProjectMembersDataTable
          columns={getProjectDataTableMemberColumns()}
          data={example}
          teamOptions={projectTeams}
        ></ProjectMembersDataTable>
      )}
    </div>
  );
}
