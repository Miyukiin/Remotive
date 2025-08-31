import "server-only";
import { getUserId } from "@/actions/user-actions";
import { auditLogs } from "../db/schema";
import { TransactionType } from "@/types";

// Audit Types
export type EntityType = "team" | "project" | "list" | "task" | "comment";
export type AuditAction =
  // TEAMS
  | "TEAM_CREATED"
  | "TEAM_UPDATED"
  | "TEAM_DELETED"
  | "TEAM_MEMBER_REMOVED"
  | "TEAM_MEMBER_ADDED"
  | "TEAM_LEADER_REASSIGNED"

  // PROJECTS
  | "PROJECT_CREATED"
  | "PROJECT_UPDATED"
  | "PROJECT_DELETED"
  | "PROJECT_TEAM_ADDED"
  | "PROJECT_TEAM_REMOVED"
  | "PROJECT_MEMBER_ADDED"
  | "PROJECT_MEMBER_REMOVED"
  | "PROJECT_MEMBER_ROLE_UPDATED"
  

  // LISTS
  | "LIST_CREATED"
  | "LIST_UPDATED"
  | "LIST_DELETED"
  | "LIST_MOVED"

  // COMMENTS
  | "COMMENT_CREATED"
  | "COMMENT_UPDATED"
  | "COMMENT_DELETED"

  // TASKS
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_DELETED"
  | "TASK_MOVED"
  | "TASK_MEMBER_ASSIGNED"
  | "TASK_MEMBER_REMOVED";

// Audit Utility Function
export async function logAction(
  tx: TransactionType,
  params: {
    actor_user_id?: number;
    entity_type: EntityType;
    entity_id: number;
    action: AuditAction;
    subject_user_id?: number;

    // Pass what is relevant
    team_id?: number | null;
    project_id?: number | null;
    list_id?: number | null;
    task_id?: number | null;
    comment_id?: number | null;
  },
) {
  const {
    entity_type,
    entity_id,
    action,
    subject_user_id = null,
    team_id = null,
    project_id = null,
    list_id = null,
    task_id = null,
    comment_id = null,
  } = params;

  let { actor_user_id = null } = params;
  // If no actor_user_id passed, log current user as actor.
  if (actor_user_id === null) {
    const res = await getUserId();
    if (!res.success) throw new Error(res.message);
    actor_user_id = res.data.id;
  }

  const logResult = await tx
    .insert(auditLogs)
    .values({
      actor_user_id,
      subject_user_id,
      entity_type,
      entity_id,
      action,
      team_id,
      project_id,
      list_id,
      task_id,
      comment_id,
    })
    .returning();
  if (logResult.length === 0) throw new Error(`Audit failed: ${entity_type}:${entity_id} action=${action}`);
}
