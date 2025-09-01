"use server";

import { queries } from "@/lib/db/queries/queries";
import * as types from "../types/index";
import { ServerActionResponse } from "./actions-types";
import {
  addUsersToTeamSchema,
  assignTeamLeaderSchema,
  checkUserIsLeaderSchema,
  idSchema,
  removeUsersFromTeamSchema,
  teamNameSchema,
  teamSchemaDB,
  teamSchemaForm,
} from "@/lib/validations/validations";
import z from "zod";
import { getUserId } from "./user-actions";
import { checkAuthenticationStatus } from "./actions-utils";
import { failResponse, successResponse } from "@/lib/db/queries/query_utils";
import { ProjectMember } from "@/components/projects/members/columns-data-table-project-members";
import { db } from "@/lib/db/db-index";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ROLE_RANK } from "@/lib/utils";

// Utilities
export async function checkUserIsLeaderAction(
  user_id: number,
  team_id: number,
): Promise<ServerActionResponse<boolean>> {
  await checkAuthenticationStatus();

  const parsed = checkUserIsLeaderSchema.safeParse({ user_id, team_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  const userIsLeaderResponse = await queries.teams.checkUserIsLeader(user_id, team_id);

  return userIsLeaderResponse.success ? userIsLeaderResponse : userIsLeaderResponse;
}

export async function checkTeamNameUnique(teamName: string): Promise<ServerActionResponse<boolean>> {
  await checkAuthenticationStatus();

  const parsed = teamNameSchema.safeParse({ teamName });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  const nameIsUniqueResponse = await queries.teams.checkTeamNameUnique(teamName);

  return nameIsUniqueResponse.success ? nameIsUniqueResponse : nameIsUniqueResponse;
}

// Fetches
export async function getTeamByIdAction(team_id: number): Promise<ServerActionResponse<types.TeamsSelect>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({ id: team_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.teams.getById(team_id);
}

export async function getTeamLeaderAction(team_id: number): Promise<ServerActionResponse<types.UserSelect>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({ id: team_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.teams.getTeamLeader(team_id);
}

export async function getProjectsForTeamAction(team_id: number): Promise<ServerActionResponse<types.ProjectSelect[]>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({ id: team_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.teams.getProjectsForTeam(team_id);
}

export async function getProjectsCountForMemberAction(
  member_id: number,
): Promise<ServerActionResponse<types.ProjectMembersSelect[]>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({ id: member_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.teams.getProjectsForTeamMember(member_id);
}

export async function getUsersForTeam(team_id: number): Promise<ServerActionResponse<types.UserSelect[]>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({ id: team_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.teams.getAllTeamMembers(team_id);
}

export async function getTeamsForUser(user_id: number): Promise<ServerActionResponse<types.TeamsSelect[]>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({ id: user_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.teams.getTeamsForUser(user_id);
}

export async function getTeamsForProject(project_id: number): Promise<ServerActionResponse<types.TeamsSelect[]>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({ id: project_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.teams.getTeamsForProject(project_id);
}

export async function getProjectMembersTableData(project_id: number): Promise<ServerActionResponse<ProjectMember[]>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({ id: project_id });
  if (!parsed.success) return failResponse("Zod Validation Error", z.flattenError(parsed.error));

  try {
    // Retrieve raw data per user, that we'll need
    const rows = await db
      .select({
        // user
        userId: schema.users.id,
        clerkId: schema.users.clerkId,
        email: schema.users.email,
        name: schema.users.name,
        image_url: schema.users.image_url,
        userCreatedAt: schema.users.createdAt,
        userUpdatedAt: schema.users.updatedAt,
        // team
        teamId: schema.teams.id,
        teamName: schema.teams.teamName,
        teamDescription: schema.teams.description,
        teamCreatedAt: schema.teams.createdAt,
        teamUpdatedAt: schema.teams.updatedAt,
        // role
        roleName: schema.roles.role_name,
      })
      .from(schema.project_members)
      .innerJoin(schema.users, eq(schema.project_members.user_id, schema.users.id))
      .innerJoin(schema.teams, eq(schema.project_members.team_id, schema.teams.id))
      .innerJoin(schema.roles, eq(schema.project_members.role, schema.roles.id))
      .where(eq(schema.project_members.project_id, project_id));

    // Helper type to map the data we gathered to the expected shape
    type Agg = {
      user: ProjectMember["user"];
      teams: ProjectMember["teams"];
      teamIds: Set<number>;
      chosenRole: types.ProjectRoles;
      roleRank: number;
    };

    const byUser = new Map<number, Agg>();

    // Map the data to shape
    for (const r of rows) {
      let agg = byUser.get(r.userId);
      if (!agg) {
        const role = r.roleName;
        agg = {
          user: {
            id: r.userId,
            clerkId: r.clerkId,
            email: r.email,
            name: r.name,
            image_url: r.image_url,
            createdAt: r.userCreatedAt,
            updatedAt: r.userUpdatedAt,
          },
          teams: [],
          teamIds: new Set<number>(),
          chosenRole: role,
          roleRank: ROLE_RANK[role],
        };
        byUser.set(r.userId, agg);
      }

      // dedupe teams
      if (!agg.teamIds.has(r.teamId)) {
        agg.teamIds.add(r.teamId);
        agg.teams.push({
          id: r.teamId,
          teamName: r.teamName,
          description: r.teamDescription,
          createdAt: r.teamCreatedAt,
          updatedAt: r.teamUpdatedAt,
        });
      }

      // pick highest role seen
      const role = r.roleName;
      const rank = ROLE_RANK[role];
      if (rank > agg.roleRank) {
        agg.chosenRole = role;
        agg.roleRank = rank;
      }
    }

    // Mold to expected shape per member, with sotrings
    const result: ProjectMember[] = Array.from(byUser.values()).map((v) => ({
      user: v.user,
      teams: v.teams.sort((a, b) => a.teamName.localeCompare(b.teamName)),
      roles: v.chosenRole,
    }));

    // sort users by name
    result.sort((a, b) => (a.user.name ?? "").localeCompare(b.user.name ?? ""));

    return successResponse("Project members data retrieved successfully.", result);
  } catch (e) {
    return failResponse("Unable to retrieve project members data.", e);
  }
}

// Mutations
export async function updateTeamAction(
  team_id: number,
  newData: z.infer<typeof teamSchemaForm>,
): Promise<ServerActionResponse<types.TeamsSelect>> {
  await checkAuthenticationStatus();

  const res = await queries.teams.getById(team_id);
  if (!res.success) return res;

  const teamDBData: z.infer<typeof teamSchemaDB> = {
    ...res.data,
    ...newData,
  };

  const parsed = teamSchemaDB.safeParse(teamDBData);
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.teams.updateTeam(team_id, teamDBData);
}

export async function reassignTeamLeaderAction(
  old_leader_id: number,
  new_leader_id: number,
  team_id: number,
): Promise<ServerActionResponse<types.UserSelect>> {
  await checkAuthenticationStatus();

  const parsed = assignTeamLeaderSchema.safeParse({ old_leader_id, new_leader_id, team_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.teams.reassignTeamLeader(old_leader_id, new_leader_id, team_id);
}

export async function deleteTeamAction(team_id: number): Promise<ServerActionResponse<types.TeamsSelect>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({ id: team_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.teams.deleteTeam(team_id);
}

export async function addUsersToTeamAction(
  users_ids: number[],
  team_id: number,
): Promise<ServerActionResponse<boolean>> {
  await checkAuthenticationStatus();
  const parsed = addUsersToTeamSchema.safeParse({ user_Ids: users_ids, team_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  for (const user_id of users_ids) {
    const res = await queries.teams.addUserToTeam(user_id, team_id, false);
    if (!res.success) return res;
  }

  return successResponse("Successfully added users as members", true);
}

export async function removeUserFromTeamAction(
  user_id: number,
  team_id: number,
): Promise<ServerActionResponse<boolean>> {
  await checkAuthenticationStatus();

  const parsed = removeUsersFromTeamSchema.safeParse({ user_id, team_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  const res = await queries.teams.removeUserFromTeam(user_id, team_id);
  if (!res.success) return res;

  return successResponse("Successfully removed users as members", true);
}

export async function createTeamAction(
  teamFormData: z.infer<typeof teamSchemaForm>,
): Promise<ServerActionResponse<types.TeamsSelect>> {
  await checkAuthenticationStatus();

  const user = await getUserId();
  if (!user.success) return user;

  const teamObject: types.TeamsInsert = {
    ...teamFormData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const parsed = teamSchemaDB.safeParse(teamObject);
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  const createResponse = await queries.teams.createTeam(teamObject);
  if (!createResponse.success) return createResponse;

  const res = await queries.teams.addUserToTeam(user.data.id, createResponse.data.id, true);
  if (!res.success) return res;

  return successResponse("Team creation success! Invite people to your team", createResponse.data);
}
