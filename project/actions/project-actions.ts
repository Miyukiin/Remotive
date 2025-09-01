"use server";

import {
  idSchema,
  projectMemberUpdatePayloadSchema,
  projectSchemaForm,
  projectSchemaUpdateForm,
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
          .returning({ user_id: schema.project_members.user_id });

        totalUpdated += demoted.length;
      }

      // Now set the target user's rows to the target role across all their team memberships
      const promotedOrUpdated = await tx
        .update(schema.project_members)
        .set({ role: targetRoleRow.id, updatedAt: now })
        .where(
          and(
            eq(schema.project_members.project_id, project_id),
            eq(schema.project_members.user_id, member_id),
          ),
        )
        .returning({ team_id: schema.project_members.team_id });

      if (promotedOrUpdated.length === 0) {
        throw new Error("User has no membership rows in this project.");
      }

      totalUpdated += promotedOrUpdated.length;

      return { totalUpdated };
    });

    return successResponse("Successfully reassigned member role.", {
      updatedCount: result.totalUpdated, 
      newRole: { id: targetRoleRow.id, role_name: targetRoleRow.role_name },
    });
  } catch (e) {
    return failResponse("Unable to reassign member role.", e);
  }
}
