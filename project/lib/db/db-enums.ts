import { pgEnum } from "drizzle-orm/pg-core";

// Tuples
export const priorityTuple = ["low", "medium", "high"] as const; // This makes it a tuple, which is required to be passed to priorityEnum.

export const statusTuple = [
  "Completed",
  "On-hold",
  "In Progress",
  "Planning", // Default
  "Review",
] as const;

export const rolesTuple = [
  "Project Manager",
  "Project Member",
] as const;

export const listColorTuple = ["BLUE", "GRAY", "GREEN", "ORANGE", "PINK", "PURPLE", "RED", "YELLOW"] as const;

export const auditEntityTuple = ["team", "project", "list", "task", "comment"] as const;

export const auditActionTuple = [
  // TEAMS
  "TEAM_CREATED",
  "TEAM_UPDATED",
  "TEAM_DELETED",
  "TEAM_MEMBER_REMOVED",
  "TEAM_MEMBER_ADDED",
  "TEAM_LEADER_REASSIGNED",

  // PROJECTS
  "PROJECT_CREATED",
  "PROJECT_UPDATED",
  "PROJECT_DELETED",
  "PROJECT_TEAM_ADDED",
  "PROJECT_TEAM_REMOVED",
  "PROJECT_MEMBER_ADDED",
  "PROJECT_MEMBER_REMOVED",
  "PROJECT_MEMBER_ROLE_UPDATED",

  // LISTS
  "LIST_CREATED",
  "LIST_UPDATED",
  "LIST_DELETED",
  "LIST_MOVED",

  // COMMENTS
  "COMMENT_CREATED",
  "COMMENT_UPDATED",
  "COMMENT_DELETED",

  // TASKS
  "TASK_CREATED",
  "TASK_UPDATED",
  "TASK_DELETED",
  "TASK_MOVED",
  "TASK_MEMBER_ASSIGNED",
  "TASK_MEMBER_REMOVED",
] as const;

// Postgre Enums
export const priorityEnum = pgEnum("priority", priorityTuple);
export const statusEnum = pgEnum("status", statusTuple);
export const rolesEnum = pgEnum("role_name", rolesTuple);
export const listColorEnum = pgEnum("list_color", listColorTuple);
export const auditEntityEnum = pgEnum("audit_entity", auditEntityTuple);
export const auditActionEnum = pgEnum("audit_action", auditActionTuple);
