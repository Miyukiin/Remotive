import * as types from "../../../types/index";
import { db } from "../db-index";
import { getAllObject, getObjectById, getBaseFields, successResponse, failResponse } from "./query_utils";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { teams } from "@/lib/db/queries/teams-queries";
import { logAction } from "@/lib/audit/audit.utils";

export const projects = {
  getAll: async (): Promise<types.QueryResponse<Array<types.ProjectSelect>>> => {
    return getAllObject<types.ProjectSelect>("projects");
  },
  getById: async (id: number): Promise<types.QueryResponse<types.ProjectSelect>> => {
    return getObjectById<types.ProjectSelect>(id, "projects");
  },
  create: async (data: types.ProjectInsert, teamIds: number[]): Promise<types.QueryResponse<types.ProjectSelect>> => {
    try {
      const newProject = data;
      const now = new Date();

      const txResult = await db.transaction(async (tx): Promise<types.QueryResponse<types.ProjectSelect>> => {
        // Insert project
        const [insertedProject] = await tx.insert(schema.projects).values(newProject).returning();
        if (!insertedProject) throw new Error(`Database did not return a project. Check connection.`);

        // AUDIT: project created
        await logAction(tx, {
          entity_id: insertedProject.id,
          entity_type: "project",
          action: "PROJECT_CREATED",
          project_id: insertedProject.id,
        });

        // Create an entry to insert for each team
        const teamsToAssign: types.TeamsToProjectsInsert[] = teamIds.map((id) => ({
          team_id: id,
          project_id: insertedProject.id,
          createdAt: now,
          updatedAt: now,
        }));

        // Assign the teams
        const assignedTeams = await tx.insert(schema.teams_to_projects).values(teamsToAssign).returning();
        if (assignedTeams.length !== teamIds.length) throw new Error("Not all teams were assigned.");

        // AUDIT: project assigned to each team
        for (const t of assignedTeams) {
          await logAction(tx, {
            entity_id: insertedProject.id,
            entity_type: "project",
            action: "PROJECT_TEAM_ADDED",
            project_id: insertedProject.id,
            team_id: t.team_id,
          });
        }

        // Create Project Members Entries
        for (const assignedTeam of assignedTeams) {
          // Get all team members of this team
          const res = await teams.getAllTeamMembers(assignedTeam.team_id);
          if (!res.success) throw new Error(res.message);

          // Create an entry to insert for each team member
          const teamMembers = res.data;
          const membersToAssign: types.ProjectMembersInsert[] = teamMembers.map((teamMember) => ({
            team_id: assignedTeam.team_id,
            project_id: insertedProject.id,
            user_id: teamMember.id,
            role: 1, // Default
            createdAt: now,
            updatedAt: now,
          }));

          // Assign the members of this team.
          const assignedMembers = await tx.insert(schema.project_members).values(membersToAssign).returning();
          if (assignedMembers.length !== teamMembers.length) throw new Error("Not all members were assigned.");

          // AUDIT: each user added as project member
          for (const m of membersToAssign) {
            await logAction(tx, {
              entity_type: "project",
              entity_id: insertedProject.id,
              action: "PROJECT_MEMBER_ADDED",
              project_id: insertedProject.id,
              team_id: m.team_id,
              subject_user_id: m.user_id, // the user being added
            });
          }
        }

        // Insert default columns
        const defaultColumns = ["To Do", "In Progress", "Done"];

        const listsToInsert: types.ListInsert[] = defaultColumns.map((name, idx) => ({
          name: name,
          projectId: insertedProject.id,
          position: idx + 1,
          isDone: name === "Done" ? true : false,
          createdAt: now,
          updatedAt: now,
        }));

        const insertedLists = await tx.insert(schema.lists).values(listsToInsert).returning();
        if (insertedLists.length !== defaultColumns.length) throw new Error("Not all default columns were created.");

        // AUDIT: each default list created
        for (const l of insertedLists) {
          await logAction(tx, {
            entity_id: l.id,
            entity_type: "list",
            action: "LIST_CREATED",
            list_id: l.id,
            project_id: insertedProject.id,
          });
        }

        // Insert default project labels
        const defaultLabels: { name: string; color: string }[] = [
          { name: "Bug", color: "#DC2626" }, // Red
          { name: "Feature", color: "#2563EB" }, // Blue
          { name: "Improvement", color: "#16A34A" }, // Green
          { name: "Chore", color: "#6B7280" }, // Gray
          { name: "Urgent", color: "#F59E0B" }, // Amber
        ];

        const labelsToInsert: types.LabelInsert[] = defaultLabels.map((label) => ({
          project_id: insertedProject.id,
          name: label.name,
          color: label.color,
          isDefault: true,
          createdAt: now,
          updatedAt: now,
        }));

        const insertedLabels = await tx.insert(schema.project_labels).values(labelsToInsert).returning();
        if (insertedLabels.length !== defaultLabels.length) throw new Error("Not all default labels were created.");

        return successResponse(`Created project successfully.`, insertedProject);
      });

      if (txResult.success) return successResponse(txResult.message, txResult.data);
      throw new Error("Project database creation transaction failed.");
    } catch (e) {
      return failResponse(`Unable to create the project.`, e);
    }
  },
  update: async (
    project_id: number,
    incomingProject: types.ProjectInsert,
  ): Promise<types.QueryResponse<types.ProjectSelect>> => {
    try {
      const response = await projects.getById(project_id);
      if (!response.success) throw new Error(response.message);

      const existingProject = response.data;

      const changed: Partial<types.ProjectInsert> = {};
      if (existingProject.name !== incomingProject.name) changed.name = incomingProject.name;
      if (existingProject.status !== incomingProject.status) changed.status = incomingProject.status;
      if (existingProject.ownerId !== incomingProject.ownerId) changed.ownerId = incomingProject.ownerId;
      if (existingProject.description !== incomingProject.description)
        changed.description = incomingProject.description;
      if (existingProject.dueDate !== incomingProject.dueDate) changed.dueDate = incomingProject.dueDate;

      const finalUpdatedObjectData = {
        ...getBaseFields(existingProject),
        ...changed,
        ...(Object.keys(changed).length > 0 ? { updatedAt: new Date() } : {}),
      };

      if (Object.keys(changed).length === 0) return successResponse(`No changes detected.`, existingProject);

      const txResult = await db.transaction(async (tx): Promise<types.QueryResponse<types.ProjectSelect>> => {
        const [result] = await tx
          .update(schema.projects)
          .set(finalUpdatedObjectData)
          .where(eq(schema.projects.id, project_id))
          .returning();

        if (!result) throw new Error("Database returned no result.");

        // AUDIT: project updated
        await logAction(tx, {
          entity_id: result.id,
          entity_type: "project",
          action: "PROJECT_UPDATED",
          project_id: result.id,
        });

        return successResponse(`Updated project successfully.`, result);
      });

      if (txResult.success) return txResult;
      return failResponse(`Unable to update project.`, `Database returned no result.`);
    } catch (e) {
      return failResponse(`Unable to update project.`, e);
    }
  },
  delete: async (id: number): Promise<types.QueryResponse<types.ProjectSelect>> => {
    try {
      const txResult = await db.transaction<types.QueryResponse<types.ProjectSelect>>(async (tx) => {
        const toDelete = await tx.query.projects.findFirst({
          where: eq(schema.projects.id, id),
        });

        if (!toDelete) throw new Error("Project not found.");

        const [deleted] = await tx.delete(schema.projects).where(eq(schema.projects.id, id)).returning();

        if (!deleted) throw new Error("Database returned no result.");

        // This is as we can't set project id for recent activity visibility, so we set team id instead so we can still see it.
        const teamRows = await tx
          .select({ teamId: schema.teams_to_projects.team_id })
          .from(schema.teams_to_projects)
          .where(eq(schema.teams_to_projects.project_id, id));
        
        const teamIds = teamRows.map((r) => r.teamId);
        for (const id of teamIds) {
          // AUDIT: project deleted
          await logAction(tx, {
            entity_type: "project",
            entity_id: deleted.id,
            action: "PROJECT_DELETED",
            team_id: id,
          });
        }

        return successResponse(`Deleted project successfully.`, deleted);
      });

      if (txResult.success) return successResponse(txResult.message, txResult.data);
      return failResponse(`Unable to delete project.`, `Project database deletion transaction failed.`);
    } catch (e) {
      return failResponse(`Unable to delete project.`, e);
    }
  },
  checkProjectNameUnique: async (project_name: string): Promise<types.QueryResponse<boolean>> => {
    try {
      const result = await db.select().from(schema.projects).where(eq(schema.projects.name, project_name));

      const isUnique = result.length === 0;
      const message = isUnique
        ? "There exists no project with this name. You are free to use this name."
        : "There exists a project with this name. Please choose another name.";

      return successResponse(message, isUnique);
    } catch (e) {
      return failResponse(`Unable to check if project name is unique.`, e);
    }
  },
  getAllMembersForProject: async (project_id: number): Promise<types.QueryResponse<types.UserSelect[]>> => {
    try {
      const result = await db
        .select()
        .from(schema.teams)
        .innerJoin(schema.project_members, eq(schema.project_members.team_id, schema.teams.id))
        .where(eq(schema.project_members.project_id, project_id));

      // Extract the teams
      const teamsForProject = result.map((row) => row.teams);

      // Deduplicate teams
      const uniqueTeamsId = Array.from(new Set(teamsForProject.map((t) => t.id)));
      const uniqueTeamsForProject = uniqueTeamsId
        .map((id) => teamsForProject.find((t) => t.id === id))
        .filter((t) => t !== undefined);

      const memberTeams = await uniqueTeamsForProject.reduce(
        async (accPromise, cv) => {
          const acc = await accPromise;

          const teamMembers = await teams.getAllTeamMembers(cv.id);

          if (!teamMembers.success) throw new Error("Unable to get members of teams");

          acc.push(...teamMembers.data);

          return acc;
        },
        Promise.resolve([] as types.UserSelect[]),
      );

      // Deduplicate members
      const uniqueMembersId = Array.from(new Set(memberTeams.map((t) => t.id)));
      const uniqueMembersForProject = uniqueMembersId
        .map((id) => memberTeams.find((m) => m.id === id))
        .filter((m) => m !== undefined);

      if (!uniqueMembersForProject)
        return failResponse(`Unable to retrieve the members of the project.`, `Database returned no results`);

      return successResponse("Successfully retrieved members of the project.", uniqueMembersForProject);
    } catch (e) {
      return failResponse(`Unable to retrieve the members of the project.`, e);
    }
  },
  getProjectsForUser: async (userId: number): Promise<types.QueryResponse<types.ProjectSelect[]>> => {
    try {
      // Join users To Teams and teams to Projects to retrieve projects of the user.
      const result = await db
        .select({ project: schema.projects })
        .from(schema.users_to_teams)
        .innerJoin(schema.teams_to_projects, eq(schema.teams_to_projects.team_id, schema.users_to_teams.team_id))
        .innerJoin(schema.projects, eq(schema.projects.id, schema.teams_to_projects.project_id))
        .where(eq(schema.users_to_teams.user_id, userId));

      const userProjects = result.map((row) => row.project);

      // De-duplicate projects of user, necessary as a user can be assigned to multiple teams which may be assigned to the same project.
      // Retrieve unique project ids
      const userProjectsId = Array.from(new Set(userProjects.map((p) => p.id)));
      // Retrieve project objects with ids, undefined if not found.
      const uniqueProjectsWithUndefined = userProjectsId.map((id) => userProjects.find((project) => project.id === id));
      // Remove any undefineds
      const uniqueProjects = uniqueProjectsWithUndefined.filter((project) => project !== undefined);

      if (uniqueProjects === undefined)
        return failResponse(`Unable to retrieve user projects.`, `Database returned no result.`);

      return successResponse(`Successfully retrieved user projects.`, uniqueProjects);
    } catch (e) {
      return failResponse(`Unable to retrieve user projects.`, e);
    }
  },
};
