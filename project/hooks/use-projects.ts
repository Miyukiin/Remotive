// TODO: Task 4.1 - Implement project CRUD operations
// TODO: Task 4.2 - Create project listing and dashboard interface

/*
TODO: Implementation Notes for Interns:

Custom hook for project data management:
- Fetch projects list
- Create new project
- Update project
- Delete project
- Search/filter projects
- Pagination

Features:
- React Query/SWR for caching
- Optimistic updates
- Error handling
- Loading states
- Infinite scrolling (optional)

Example structure:
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useProjects() {
  const queryClient = useQueryClient()
  
  const {
    data: projects,
    isLoading,
    error
  } = useQuery({
    queryKey: ['projects'],
    queryFn: () => queries.projects.getAll()
  })
  
  const createProject = useMutation({
    mutationFn: queries.projects.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })
  
  return {
    projects,
    isLoading,
    error,
    createProject: createProject.mutate,
    isCreating: createProject.isPending
  }
}

Dependencies to install:
- @tanstack/react-query (recommended)
- OR swr (alternative)
*/

// Placeholder to prevent import errors

"use client";
import {
  createProjectAction,
  deleteProjectAction,
  getAllMembersForProject,
  getProjectByIdAction,
  getProjectsForUserAction,
  reassignProjectMemberRole,
  updateProjectAction,
  updateProjectTeamsAction,
} from "@/actions/project-actions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectSchemaForm, projectSchemaUpdateForm } from "../lib/validations/validations";
import z from "zod";
import { toast } from "sonner";
import { getUserId } from "@/actions/user-actions";
import { getTasksCountForProjectAction } from "@/actions/task-actions";
import { ProjectRoles, ProjectSelect, UpdateProjectTeamsPayload } from "@/types";
import { getTempId } from "@/lib/utils";
import { getProjectMembersTableData } from "@/actions/teams-actions";
import { ProjectMember } from "@/components/projects/members/columns-data-table-project-members";
import { redirect } from "next/navigation";

// Projects list
export function useProjects(project_id?: number) {
  const queryClient = useQueryClient();

  const {
    data: projects,
    isLoading: isProjectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const me = await getUserId();
      if (!me.success) throw new Error(me.message);
      const res = await getProjectsForUserAction(me.data.id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const taskCount = useQuery({
    queryKey: ["task_count", project_id],
    enabled: typeof project_id === "number",
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey as ["task_count", number];
      const res = await getTasksCountForProjectAction(id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const getProjectById = useQuery({
    queryKey: ["project", project_id],
    enabled: typeof project_id === "number",
    queryFn: async ({ queryKey }) => {
      const [, project_id] = queryKey as ["project", number];
      const res = await getProjectByIdAction(project_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const createProject = useMutation({
    mutationFn: async (projectFormData: z.infer<typeof projectSchemaForm>) => {
      const res = await createProjectAction(projectFormData);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async (projectFormData: z.infer<typeof projectSchemaForm>) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });

      const previousProjects = queryClient.getQueryData<ProjectSelect[]>(["projects"]);

      const tempId = getTempId();

      const res = await getUserId(); // Retrieve user's id
      if (!res.success) throw new Error(res.message);
      const ownerId = res.data.id;

      if (ownerId === undefined) throw new Error("Unable to get current user."); // Guard against undefined ownerId

      // Build an optimistic project
      const now = new Date();
      const optimisticProject: ProjectSelect = {
        id: tempId,
        name: projectFormData.name,
        description: projectFormData.description,
        ownerId: ownerId,
        dueDate: projectFormData.dueDate,
        status: "Planning",
        createdAt: now,
        updatedAt: now,
      };

      queryClient.setQueryData<ProjectSelect[]>(["projects"], (old) => (old ? [...old, optimisticProject] : old));

      return { previousProjects, tempId };
    },
    onSuccess: (createdProject, _vars, context) => {
      toast.success("Success", { description: "Successfully created the project." });

      // We replace optimistic project with the tempId with the server-sourced project with actual id
      queryClient.setQueryData<ProjectSelect[]>(
        ["projects"],
        (old) => old?.map((p) => (p.id === context.tempId ? createdProject : p)) ?? old,
      );
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["projects"], context?.previousProjects);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", project_id] });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (project_id: number) => {
      const res = await deleteProjectAction(project_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async (project_id: number) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });

      const previousProjects = queryClient.getQueryData<ProjectSelect[]>(["projects"]);

      queryClient.setQueryData<ProjectSelect[]>(["projects"], (old) =>
        old ? old.filter((p) => p.id != project_id) : old,
      );

      return { previousProjects };
    },
    onSuccess: () => {
      toast.success("Success", { description: "Successfully deleted the project." });
      redirect("/projects");
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["projects"], context?.previousProjects);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", project_id] });
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({
      project_id,
      projectFormData,
    }: {
      project_id: number;
      projectFormData: z.infer<typeof projectSchemaUpdateForm>;
    }) => {
      const res = await updateProjectAction(project_id, projectFormData);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({ project_id, projectFormData }) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });

      const previousProjects = queryClient.getQueryData<ProjectSelect[]>(["projects"]);

      // Optimistically update the team with the inputted projectFormData
      queryClient.setQueryData<ProjectSelect[]>(["projects"], (old) =>
        old
          ? old.map((p) =>
              p.id === project_id
                ? {
                    ...p,
                    ...projectFormData,
                  }
                : p,
            )
          : old,
      );

      return { previousProjects };
    },
    onSuccess: () => {
      toast.success("Success", { description: "Successfully updated the project." });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["projects"], context?.previousProjects);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", project_id] });
    },
  });

  return {
    // Projects for user
    projects,
    isProjectsLoading,
    projectsError,

    // Project by Id
    project: getProjectById.data,
    isProjectLoading: getProjectById.isLoading,
    projectError: getProjectById.error,

    // Project's task count
    taskCount: taskCount.data,
    isTaskCountLoading: taskCount.isLoading,
    taskCountError: taskCount.error,

    // Mutations
    createProject: createProject.mutate,
    isProjectCreationLoading: createProject.isPending,
    projectCreationError: createProject.error,

    deleteProject: deleteProject.mutate,
    isProjectDeleteLoading: deleteProject.isPending,
    deleteProjectError: deleteProject.error,

    updateProject: updateProject.mutate,
    isProjectUpdateLoading: updateProject.isPending,
    updateProjectError: updateProject.error,
  };
}

export function useProjectMembers(projectId: number) {
  const queryClient = useQueryClient();

  const projectMembers = useQuery({
    queryKey: ["project_members", projectId],
    enabled: typeof projectId === "number",
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey as ["project_members", number];
      const res = await getAllMembersForProject(id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const projectMembersDataTable = useQuery({
    queryKey: ["project_members_data_table", projectId],
    enabled: typeof projectId === "number",
    queryFn: async ({ queryKey }) => {
      const [, project_id] = queryKey as ["project_members_data_table", number];
      const res = await getProjectMembersTableData(project_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const updateProjectMember = useMutation({
    mutationFn: async ({ member_id, role }: { member_id: number; role: ProjectRoles }) => {
      const res = await reassignProjectMemberRole({ member_id, project_id: projectId, role });
      if (!res.success) throw new Error(res.message);
      return res.data; // { updatedCount, newRole }
    },

    // Optimistic update of the DataTable list
    onMutate: async ({ member_id, role }) => {
      await queryClient.cancelQueries({ queryKey: ["project_members_data_table", projectId] });
      await queryClient.cancelQueries({ queryKey: ["project_members", projectId] });

      const previousProjectMemberTableData = queryClient.getQueryData<ProjectMember[]>([
        "project_members_data_table",
        projectId,
      ]);

      // optimistic patch: update the role string for the matching user id
      if (previousProjectMemberTableData) {
        queryClient.setQueryData<ProjectMember[]>(
          ["project_members_data_table", projectId],
          previousProjectMemberTableData.map((row) => (row.user.id === member_id ? { ...row, roles: role } : row)),
        );
      }

      return { previousProjectMemberTableData };
    },

    onSuccess: () => {
      toast.success("Success", {
        description: `Updated member role successfully.`,
      });
    },

    onError: (err, _vars, ctx) => {
      toast.error("Error", { description: err.message });
      // rollback
      if (ctx?.previousProjectMemberTableData) {
        queryClient.setQueryData(["project_members_data_table", projectId], ctx?.previousProjectMemberTableData);
      }
    },

    onSettled: async () => {
      // ensure server truth after mutation
      await queryClient.invalidateQueries({ queryKey: ["project_members_data_table", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["project_members", projectId] });
    },
  });

  const reassignProjectTeams = useMutation({
    mutationFn: async ({ project_id, toAdd, toRemove }: UpdateProjectTeamsPayload) => {
      const res = await updateProjectTeamsAction({ project_id: projectId, toAdd, toRemove });
      if (!res.success) throw new Error(res.message);
      return res.data; // { addedTeamIds, removedTeamIds, insertedMembers, deletedMembers }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["project_members_data_table", projectId] });
      await queryClient.cancelQueries({ queryKey: ["project_members", projectId] });
      await queryClient.cancelQueries({ queryKey: ["teams", projectId] });
      return {};
    },
    onSuccess: () => {
      toast.success("Success", { description: "Successfully updated project teams." });
    },
    onError: (error) => {
      toast.error("Error", { description: error.message });
    },
    onSettled: async () => {
      // Always re-fetch canonical server state after changes
      await queryClient.invalidateQueries({ queryKey: ["project_members_data_table", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["project_members", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["teams", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["project", projectId] }); // update updatedAt etc.
    },
  });

  return {
    // Retrieve UserSelect data type project members
    projectMembers: projectMembers.data,
    isProjectMembersLoading: projectMembers.isLoading,
    projectMembersError: projectMembers.error,

    // Retrieve project members data for data table of Type Project Member
    projectMembersData: projectMembersDataTable.data,
    isProjectMembersDataLoading: projectMembersDataTable.isLoading,
    projectMembersDataError: projectMembersDataTable.error,

    // Update project member role
    updateProjectMember: updateProjectMember.mutate,
    isUpdateProjectMemberLoading: updateProjectMember.isPending,
    updateProjectMemberError: updateProjectMember.error,

    // Update project teams
    reassignProjectTeams: reassignProjectTeams.mutate,
    reassignProjectTeamsAsync: reassignProjectTeams.mutateAsync,
    isReassignProjectTeamsLoading: reassignProjectTeams.isPending,
    reassignProjectTeamsError: reassignProjectTeams.error,
  };
}
