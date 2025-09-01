"use server";

import {
  idSchema,
  projectMemberUpdatePayloadSchema,
  projectSchemaForm,
  projectSchemaUpdateForm,
  updateProjectTeamsPayload,
} from "@/lib/validations/validations";
import z from "zod";
import { queries } from "@/lib/db/queries/queries";
import { projectSchemaDB } from "../lib/validations/validations";
import { ServerActionResponse } from "./actions-types";
import * as types from "@/types";
import { checkAuthenticationStatus } from "./actions-utils";
import { getUserId } from "./user-actions";
import { failResponse, successResponse } from "@/lib/db/queries/query_utils";
import { db } from "@/lib/db/db-index";
import * as schema from "@/lib/db/schema";
import { and, eq, inArray, ne } from "drizzle-orm";
import { logAction } from "@/lib/audit/audit.utils";

// Utility
export async function checkProjectNameUnique(ProjectName: string): Promise<ServerActionResponse<boolean>> {
  await checkAuthenticationStatus();
  return await queries.projects.checkProjectNameUnique(ProjectName);
}

// Fetches
export async function getProjectsForUserAction(user_id: number): Promise<ServerActionResponse<types.ProjectSelect[]>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({ id: user_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.projects.getProjectsForUser(user_id);
}

export async function getProjectByIdAction(project_id: number): Promise<ServerActionResponse<types.ProjectSelect>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({ id: project_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.projects.getById(project_id);
}

export async function getAllProjects(): Promise<ServerActionResponse<types.ProjectSelect[]>> {
  await checkAuthenticationStatus();
  return await queries.projects.getAll();
}

export async function getAllMembersForProject(project_id: number): Promise<ServerActionResponse<types.UserSelect[]>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({ id: project_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.projects.getAllMembersForProject(project_id);
}

// Mutations
export async function createProjectAction(
  projectFormData: z.infer<typeof projectSchemaForm>,
): Promise<ServerActionResponse<types.ProjectSelect>> {
  await checkAuthenticationStatus();

  const res = await getUserId();
  if (!res.success) return res;

  const projectDBData: z.infer<typeof projectSchemaDB> = {
    ...projectFormData,
    status: "Planning",
    ownerId: res.data.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const parsed = projectSchemaDB.safeParse(projectDBData);
  if (!parsed.success) return failResponse(`Zod Validation Error`, parsed.error);

  const assignedTeams: number[] = projectFormData.teamIds;
  return await queries.projects.create(projectDBData, assignedTeams);
}

export async function updateProjectAction(
  project_id: number,
  projectFormData: z.infer<typeof projectSchemaUpdateForm>,
): Promise<ServerActionResponse<types.ProjectSelect>> {
  await checkAuthenticationStatus();

  const res = await queries.projects.getById(project_id);
  if (!res.success) return res;

  const projectDBData: z.infer<typeof projectSchemaDB> = {
    ...res.data,
    ...projectFormData,
  };

  const parsed = projectSchemaDB.safeParse(projectDBData);
  if (!parsed.success) return failResponse(`Zod Validation Error`, parsed.error);

  return await queries.projects.update(project_id, projectDBData);
}

export async function deleteProjectAction(project_id: number): Promise<ServerActionResponse<types.ProjectSelect>> {
  await checkAuthenticationStatus();
  return await queries.projects.delete(project_id);
}

export async function reassignProjectMemberRole({
  member_id,
  project_id,
  role,
}: z.infer<typeof projectMemberUpdatePayloadSchema>): Promise<
  ServerActionResponse<{ updatedCount: number; newRole: { id: number; role_name: string } }>
> {
  await checkAuthenticationStatus();

  const parsed = projectMemberUpdatePayloadSchema.safeParse({ member_id, project_id, role });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  try {
    // Pull role ids for both "Project Manager" and "Project Member" up front
    const roleRows = await db
      .select({ id: schema.roles.id, role_name: schema.roles.role_name })
      .from(schema.roles)
      .where(inArray(schema.roles.role_name, ["Project Manager", "Project Member"] as const));

    const pmRole = roleRows.find((r) => r.role_name === "Project Manager");
    const memberRole = roleRows.find((r) => r.role_name === "Project Member");
    if (!pmRole || !memberRole) {
      return failResponse("Required roles not found in roles table.", null);
    }

    // Target role row (from payload)
    const targetRoleRow = roleRows.find((r) => r.role_name === role);
    if (!targetRoleRow) {
      return failResponse(`Role "${role}" does not exist.`, null);
    }

    const now = new Date();

    const result = await db.transaction(async (tx) => {
      let totalUpdated = 0;

      // If promoting to PM, demote all other PMs first (within the same project)
      if (role === "Project Manager") {
        const demoted = await tx
          .update(schema.project_members)
          .set({ role: memberRole.id, updatedAt: now })
          .where(
            and(
              eq(schema.project_members.project_id, project_id),
              eq(schema.project_members.role, pmRole.id),
              ne(schema.project_members.user_id, member_id), // everyone except the new PM
            ),
          )
          .returning({
            user_id: schema.project_members.user_id,
            team_id: schema.project_members.team_id,
          });

        totalUpdated += demoted.length;

        // AUDIT: log each demotion (PM -> Member)
        for (const row of demoted) {
          await logAction(tx, {
            entity_type: "project",
            entity_id: project_id,
            action: "PROJECT_MEMBER_ROLE_UPDATED",
            project_id,
            team_id: row.team_id,
            subject_user_id: row.user_id,
          });
        }
      }

      // Now set the target user's rows to the target role across all their team memberships
      const promotedOrUpdated = await tx
        .update(schema.project_members)
        .set({ role: targetRoleRow.id, updatedAt: now })
        .where(and(eq(schema.project_members.project_id, project_id), eq(schema.project_members.user_id, member_id)))
        .returning({ team_id: schema.project_members.team_id });

      if (promotedOrUpdated.length === 0) {
        throw new Error("User has no membership rows in this project.");
      }

      totalUpdated += promotedOrUpdated.length;

      // AUDIT: role changes for each member
      for (const row of promotedOrUpdated) {
        await logAction(tx, {
          entity_type: "project",
          entity_id: project_id,
          action: "PROJECT_MEMBER_ROLE_UPDATED",
          project_id,
          team_id: row.team_id,
          subject_user_id: member_id,
        });
      }

      return { totalUpdated };
    });

    return successResponse("Successfully reassigned member role.", {
      updatedCount: result.totalUpdated,
      newRole: { id: targetRoleRow.id, role_name: targetRoleRow.role_name },
    });
  } catch (e) {
    console.log(e)
    return failResponse("Unable to reassign member role.", e);
  }
}
export async function updateProjectTeamsAction(payload: types.UpdateProjectTeamsPayload): Promise<
  ServerActionResponse<{
    addedTeamIds: number[];
    removedTeamIds: number[];
    insertedMembers: number;
    deletedMembers: number;
  }>
> {
  await checkAuthenticationStatus();

  const parsed = updateProjectTeamsPayload.safeParse(payload);
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  const { project_id, toAdd, toRemove } = parsed.data;

  try {
    const now = new Date();

    const result = await db.transaction(async (tx) => {
      // Resolve default "Project Member" role id
      const roleRows = await tx.select({ id: schema.roles.id, role_name: schema.roles.role_name }).from(schema.roles);
      const memberRole = roleRows.find((r) => r.role_name === "Project Member");
      if (!memberRole) throw new Error('Required role "Project Member" not found.');

      const pmRole = roleRows.find((r) => r.role_name === "Project Manager");
      if (!pmRole) throw new Error('Required role "Project Manager" not found.');

      // Throw an error *iff* the (only) Project Manager's current teams are ALL included in `toRemove`.
      // We intentionally do NOT consider `toAdd` here.
      if (toRemove.length > 0) {
        // Current PM memberships (pre-change)
        const pmRows = await tx
          .select({
            user_id: schema.project_members.user_id,
            team_id: schema.project_members.team_id,
          })
          .from(schema.project_members)
          .where(and(eq(schema.project_members.project_id, project_id), eq(schema.project_members.role, pmRole.id)));

        // If there is no PM row retrieved, that means the pm is not part of any of these teams to be removed
        const pmUserId = pmRows[0]?.user_id;
        if (pmUserId != null) {
          // The PM can be on multiple teams, so collect their current team_ids
          const pmTeamIds = new Set(pmRows.map((r) => r.team_id));

          const toRemoveSet = new Set(toRemove);
          // We check if all teams of pm is element of toRemove
          const removingAllTeamsOfPM = pmTeamIds.size > 0 && [...pmTeamIds].every((tid) => toRemoveSet.has(tid));

          // If so, throw error
          if (removingAllTeamsOfPM) {
            const [pmUser] = await tx
              .select({ id: schema.users.id, name: schema.users.name })
              .from(schema.users)
              .where(eq(schema.users.id, pmUserId))
              .limit(1);

            const label = pmUser?.name ?? `User ${pmUserId}`;
            throw new Error(
              `Cannot remove the selected teams because it would leave the Project Manager (${label}) without any team in this project. Assign them to another team first.`,
            );
          }
        }
      }

      // ADD team associations
      let insertedMembers = 0;
      if (toAdd.length > 0) {
        await tx.insert(schema.teams_to_projects).values(
          toAdd.map((team_id) => ({
            team_id,
            project_id,
            createdAt: now,
            updatedAt: now,
          })),
        );

        // AUDIT: project assigned to each added team
        for (const team_id of toAdd) {
          await logAction(tx, {
            entity_type: "project",
            entity_id: project_id,
            action: "PROJECT_TEAM_ADDED",
            project_id,
            team_id,
          });
        }
      }

      // Insert project_members entry for every user in our newly added teams
      if (toAdd.length > 0) {
        // users in those teams
        const teamUsers = await tx
          .select({ team_id: schema.users_to_teams.team_id, user_id: schema.users_to_teams.user_id })
          .from(schema.users_to_teams)
          .where(inArray(schema.users_to_teams.team_id, toAdd));

        if (teamUsers.length > 0) {
          // Map existing per-user role for this project
          // (copy if exists because it may be that the added user is already a part of the project member because he is a member of another team assigned to the project)
          const existing = await tx
            .select({
              user_id: schema.project_members.user_id,
              role: schema.project_members.role,
            })
            .from(schema.project_members)
            .where(eq(schema.project_members.project_id, project_id));

          // Build map for existing members with roles already
          const roleByUser = new Map<number, number>();
          for (const row of existing) {
            if (!roleByUser.has(row.user_id)) roleByUser.set(row.user_id, row.role);
          }

          const values = teamUsers.map((tu) => ({
            team_id: tu.team_id,
            project_id,
            user_id: tu.user_id,
            role: roleByUser.get(tu.user_id) ?? memberRole.id, // if this user already has a role in this project, keep it; otherwise default to Project Member.
            createdAt: now,
            updatedAt: now,
          }));

          const inserted = await tx
            .insert(schema.project_members)
            .values(values)
            .onConflictDoNothing({
              target: [
                schema.project_members.team_id,
                schema.project_members.project_id,
                schema.project_members.user_id,
              ],
            })
            .returning({ user_id: schema.project_members.user_id, team_id: schema.project_members.team_id });

          insertedMembers = inserted.length;

          // AUDIT: each user added as project member
          for (const row of inserted) {
            await logAction(tx, {
              entity_type: "project",
              entity_id: project_id,
              action: "PROJECT_MEMBER_ADDED",
              project_id,
              team_id: row.team_id,
              subject_user_id: row.user_id,
            });
          }
        }
      }

      // REMOVE project_members for removed teams, then remove team associations via teams to projects
      let deletedMembers = 0;
      if (toRemove.length > 0) {
        const deleted = await tx
          .delete(schema.project_members)
          .where(
            and(eq(schema.project_members.project_id, project_id), inArray(schema.project_members.team_id, toRemove)),
          )
          .returning({ user_id: schema.project_members.user_id, team_id: schema.project_members.team_id });

        deletedMembers = deleted.length;

        // AUDIT: each user removed as project member
        for (const row of deleted) {
          await logAction(tx, {
            entity_type: "project",
            entity_id: project_id,
            action: "PROJECT_MEMBER_REMOVED",
            project_id,
            team_id: row.team_id,
            subject_user_id: row.user_id,
          });
        }

        // Remove teams to projects association of teams
        await tx
          .delete(schema.teams_to_projects)
          .where(
            and(
              eq(schema.teams_to_projects.project_id, project_id),
              inArray(schema.teams_to_projects.team_id, toRemove),
            ),
          );

        // AUDIT: project unassigned from each removed team
        for (const team_id of toRemove) {
          await logAction(tx, {
            entity_type: "project",
            entity_id: project_id,
            action: "PROJECT_TEAM_REMOVED",
            project_id,
            team_id,
          });
        }
      }

      // Update project.updatedAt
      await tx.update(schema.projects).set({ updatedAt: now }).where(eq(schema.projects.id, project_id));

      return {
        addedTeamIds: toAdd,
        removedTeamIds: toRemove,
        insertedMembers,
        deletedMembers,
      };
    });

    return successResponse("Project teams updated.", result);
  } catch (e) {
    return failResponse("Unable to update project teams.", e);
  }
}
