"use server";
import "server-only";

export type TeamRole = "TEAM_LEADER" | "TEAM_MEMBER" | null; // null => not on team
export type ProjectRole = "PROJECT_MANAGER" | "PROJECT_MEMBER" | null; // null => not in project
export type Entity = "TEAM" | "PROJECT" | "LIST" | "TASK" | "COMMENT" | "LABELS";

// List of actions that are being regulated
export type TeamAction = "READ" | "UPDATE" | "DELETE" | "LEAVE" | "ADD_MEMBERS" | "REMOVE_MEMBERS" | "REASSIGN_LEADER";
export type ProjectAction =
  | "CREATE" // Create Labels, Lists, Tasks etc. Not project itself as anyone authenticated can create project
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "REASSIGN_PROJECT_ROLE"
  | "MANAGE_TEAMS";

export type LabelAction = "CREATE" | "READ" | "UPDATE" | "DELETE";
export type ListAction = "CREATE" | "READ" | "UPDATE" | "DELETE" | "MOVE";

export type AllAction = "MOVE" | "ASSIGN" | "REORDER" | TeamAction | ProjectAction | LabelAction | ListAction;

export type PermissionContext = {
  actorUserId: number;
  teamRole: TeamRole;
  isProjectMember: boolean;
  projectRole: ProjectRole;

  // Ownership
  taskAuthorIds?: number[] | null; // array because we can have multiple task assignees note that task creator can do everything that task assignees can do
  commentAuthorId?: number | null;
};

export async function canDo(entity: Entity, action: AllAction, ctx: PermissionContext): Promise<boolean> {
  const isPM = ctx.projectRole === "PROJECT_MANAGER";
  const isProjMember = !!ctx.isProjectMember;
  const isTeamLeader = ctx.teamRole === "TEAM_LEADER";

  switch (entity) {
    case "TEAM": {
      if (
        action === "UPDATE" ||
        action === "DELETE" ||
        action === "ADD_MEMBERS" ||
        action === "REMOVE_MEMBERS" ||
        action === "REASSIGN_LEADER"
      )
        return isTeamLeader;
      return ctx.teamRole !== null; // allow else action taken by this team member
    }

    case "LABELS":
      return isProjMember || isPM;
    case "PROJECT":
      if (action === "UPDATE" || action === "DELETE" || action === "REASSIGN_PROJECT_ROLE" || action === "MANAGE_TEAMS")
        return isPM;
      // For every action else, PM can do anything a member can
      return isProjMember || isPM;

    case "LIST": {
      return isProjMember || isPM;
    }

    case "TASK": {
      if (isPM) return true; // PM BYPASS
      if (!isProjMember) return false; // If attempter is not a project member

      switch (action) {
        case "READ":
        case "CREATE":
        case "ASSIGN":
        case "REORDER":
          return true; // project member can do things up to here, further requires being author id
        case "UPDATE":
        case "DELETE":
        case "MOVE": {
          const authors = ctx.taskAuthorIds ?? [];
          const isAuthor = authors.includes(ctx.actorUserId); // Check if attempter is among the task authors
          return isAuthor;
        }
        default:
          return false;
      }
    }

    case "COMMENT": {
      if (isPM) return true; // PM BYPASS
      if (!isProjMember) return false; // If attempter is not a project member

      switch (action) {
        case "READ":
        case "CREATE":
          return true; // project member can do things up to here, further requires being author id
        case "UPDATE":
        case "DELETE": {
          const isAuthor = ctx.commentAuthorId != null && ctx.commentAuthorId === ctx.actorUserId;
          return isAuthor;
        }
        default:
          return false;
      }
    }
  }
}

export async function assertCanDo(entity: Entity, action: AllAction, ctx: PermissionContext) {
  if (!canDo(entity, action, ctx)) {
    const msg = `Forbidden: user ${ctx.actorUserId} cannot ${action} ${entity}`;
    throw Object.assign(new Error(msg), { status: 403, code: "FORBIDDEN" as const });
  }
}
