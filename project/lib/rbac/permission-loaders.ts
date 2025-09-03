"use server";
import "server-only";
import { and, eq } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import type { PermissionContext, ProjectRole, TeamRole } from "./permissions";
import { db } from "../db/db-index";

/** helper func that just maps roles.role_name → ProjectRole that is specified in permissions.ts */
function mapProjectRole(roleName: string | null | undefined): ProjectRole {
  if (!roleName) return null;
  return roleName === "Project Manager" ? "PROJECT_MANAGER" : "PROJECT_MEMBER";
}

/** retrieve a user's role in the specific team, returns null if not on the team */
export async function getTeamRoleForUser(userId: number, teamId: number | null): Promise<TeamRole> {
  if (!teamId) return null;
  const [row] = await db
    .select({ isLeader: schema.users_to_teams.isLeader })
    .from(schema.users_to_teams)
    .where(and(eq(schema.users_to_teams.team_id, teamId), eq(schema.users_to_teams.user_id, userId)))
    .limit(1);

  if (!row) return null;
  return row.isLeader ? "TEAM_LEADER" : "TEAM_MEMBER";
}

/** retrieve a user's role in the specific project, returns null if not a project member */
export async function getProjectRoleForUser(userId: number, projectId: number | null) {
  if (!projectId) return { isMember: false, role: null as ProjectRole };
  const rows = await db
    .select({ roleName: schema.roles.role_name })
    .from(schema.project_members)
    .leftJoin(schema.roles, eq(schema.project_members.role, schema.roles.id))
    .where(and(eq(schema.project_members.project_id, projectId), eq(schema.project_members.user_id, userId)))
    .limit(1);
  // Returns an array since a member can be part of two teams assigned to project, and hence have multiple project member rows. but they'll both have the same project role
  // So we can only get the first entry.
  const roleName = rows[0]?.roleName ?? null;
  return { isMember: !!roleName, role: mapProjectRole(roleName) };
}

/** retrieve project id via list */
export async function getProjectIdFromList(listId: number | null): Promise<number | null> {
  if (!listId) return null;
  const row = await db.query.lists.findFirst({
    where: eq(schema.lists.id, listId),
    columns: { projectId: true },
  });
  return row?.projectId ?? null;
}

/** Helper to retrieve task's listId, projectId, creatorId given a task id */
export async function getProjectAndListFromTask(taskId: number | null): Promise<{
  listId: number | null;
  projectId: number | null;
  creatorId: number | null; // because creaotr can do anything a task assignee can do
}> {
  if (!taskId) return { listId: null, projectId: null, creatorId: null };


  const [result] = await db
    .select({
      listId: schema.tasks.listId,
      creatorId: schema.tasks.creatorId,
      projectId: schema.lists.projectId,
    })
    .from(schema.tasks)
    .leftJoin(schema.lists, eq(schema.tasks.listId, schema.lists.id))
    .where(eq(schema.tasks.id, taskId))
    .limit(1);

  const r = result;
  return { listId: r?.listId ?? null, projectId: r?.projectId ?? null, creatorId: r?.creatorId ?? null };
}

/** helper to retrieve a comment's taskId, authorId */
export async function getTaskFromComment(
  commentId: number | null,
): Promise<{ taskId: number | null; authorId: number | null }> {
  if (!commentId) return { taskId: null, authorId: null };

  const rows = await db
    .select({
      taskId: schema.comments.taskId,
      authorId: schema.comments.authorId,
    })
    .from(schema.comments)
    .where(eq(schema.comments.id, commentId))
    .limit(1);

  const row = rows[0];
  return {
    taskId: row?.taskId ?? null,
    authorId: row?.authorId ?? null,
  };
}

/** retrieve task's permitted authors, usually task assignees + task creator*/
export async function getTaskAuthorIds(
  taskId: number | null,
): Promise<number[] | null> {
  if (!taskId) return null;

  // creatorId
  const creatorRows = await db
    .select({ creatorId: schema.tasks.creatorId })
    .from(schema.tasks)
    .where(eq(schema.tasks.id, taskId))
    .limit(1);

  const creatorId = creatorRows[0]?.creatorId ?? null;

  // assignees as co-authors
  const assigneeRows = await db
    .select({ userId: schema.users_to_tasks.user_id })
    .from(schema.users_to_tasks)
    .where(eq(schema.users_to_tasks.task_id, taskId));

  const ids = new Set<number>();
  if (creatorId != null) ids.add(creatorId);
  for (const r of assigneeRows) ids.add(r.userId);

  return Array.from(ids);
}

/**
 * Build a PermissionContext by supplying any of:
 * - teamId
 * - projectId
 * - listId
 * - taskId
 * - commentId
 *
 * The loader resolves chains (comment→task→list→project) and computes:
 *  - teamRole
 *  - isProjectMember + projectRole
 *  - taskAuthorIds (multiple)
 *  - commentAuthorId (single)
 */


export async function loadPermissionContext(params: {
  actorUserId: number;
  teamId?: number | null;
  projectId?: number | null;
  listId?: number | null;
  taskId?: number | null;
  commentId?: number | null;
}): Promise<PermissionContext> {
  const { actorUserId } = params;

  // Check which one is passed, then resolve accordingly
  let projectId = params.projectId ?? null;
  let listId = params.listId ?? null;
  let taskId = params.taskId ?? null;
  const teamId = params.teamId ?? null;
  const commentId = params.commentId ?? null;

  // Comment → task
  let commentAuthorId: number | null = null;
  if (commentId) {
    const c = await getTaskFromComment(commentId);
    taskId = taskId ?? c.taskId;
    commentAuthorId = c.authorId;
  }

  // Task → list/project + authors
  let taskAuthorIds: number[] | null = null;
  if (taskId) {
    const t = await getProjectAndListFromTask(taskId);
    listId = listId ?? t.listId;
    projectId = projectId ?? t.projectId;
    taskAuthorIds = await getTaskAuthorIds(taskId);
  }

  // List → project
  if (listId && !projectId) {
    projectId = await getProjectIdFromList(listId);
  }

  // Project role/membership
  const { isMember, role } = await getProjectRoleForUser(actorUserId, projectId);

  // Get team role
  const teamRole = await getTeamRoleForUser(actorUserId, teamId);

  return {
    actorUserId,
    teamRole,
    isProjectMember: isMember || role === "PROJECT_MANAGER", // PM is always at least a member
    projectRole: role,
    taskAuthorIds,
    commentAuthorId,
  };
}
