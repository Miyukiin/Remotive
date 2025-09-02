import { failResponse } from "@/lib/db/queries/query_utils";
import { loadPermissionContext } from "./permission-loaders";
import { canDo, CommentAction, LabelAction, ListAction, ProjectAction, TaskAction, TeamAction } from "./permissions";
import * as types from "@/types/index";

// TEAMS
export function teamForbiddenMsg(action: TeamAction): string {
  switch (action) {
    case "READ":
      return "Only team members (or the team leader) can view information related to this team.";
    case "UPDATE":
      return "Only the Team Leader can update this team.";
    case "DELETE":
      return "Only the Team Leader can delete this team.";
    case "ADD_MEMBERS":
      return "Only the Team Leader can add members to this team.";
    case "REMOVE_MEMBERS":
      return "Only the Team Leader can remove members from this team.";
    case "REASSIGN_LEADER":
      return "Only the current Team Leader can reassign leadership.";
    case "LEAVE":
      return "Only team members can leave a team. Team Leaders must reassign leadership before leaving.";
    default: {
      // Unlikely
      return "You don’t have permission to perform this action on the team.";
    }
  }
}

export async function guardTeamAction<T>({
  actorUserId,
  teamId,
  action,
}: {
  actorUserId: number;
  teamId: number;
  action: TeamAction;
}): Promise<types.QueryResponse<T> | null> {
  const ctx = await loadPermissionContext({
    actorUserId,
    teamId,
  });

  if (!(await canDo("TEAM", action, ctx))) {
    return failResponse<T>(teamForbiddenMsg(action), "FORBIDDEN");
  }
  return null; // if null, then user is authorized to do action, else Not null? then it returned a fail response, forward this to the mutation func in serv action
}

// PROJECTS
export function projectForbiddenMsg(action: ProjectAction): string {
  switch (action) {
    case "READ":
      return "Only project members (or the project manager) can view this project.";
    case "CREATE":
      return "You don’t have permission to create items in this project.";
    case "UPDATE":
      return "Only the Project Manager can update this project.";
    case "DELETE":
      return "Only the Project Manager can delete this project.";
    case "REASSIGN_PROJECT_ROLE":
      return "Only the Project Manager can manage project member roles in this project.";
    case "MANAGE_TEAMS":
      return "Only the Project Manager can manage teams for this project.";

    default:
      return "You don’t have permission to perform this action on the project.";
  }
}

export async function guardProjectAction<T>({
  actorUserId,
  projectId,
  action,
}: {
  actorUserId: number;
  projectId: number;
  action: ProjectAction;
}): Promise<types.QueryResponse<T> | null> {
  const ctx = await loadPermissionContext({ actorUserId, projectId });

  if (!(await canDo("PROJECT", action, ctx))) {
    return failResponse<T>(projectForbiddenMsg(action), "FORBIDDEN");
  }
  return null; // allowed
}

// LABELS
export function labelsForbiddenMsg(action: LabelAction): string {
  switch (action) {
    case "READ":
      return "Only project members (or the project manager) can view labels for this project.";
    case "CREATE":
      return "Only project members (or the project manager) can create labels for this project.";
    case "UPDATE":
      return "Only project members (or the project manager) can update labels for this project.";
    case "DELETE":
      return "Only project members (or the project manager) can delete labels for this project.";

    default:
      return "You don’t have permission to perform this action on labels.";
  }
}

export async function guardLabelAction<T>({
  actorUserId,
  projectId,
  action,
}: {
  actorUserId: number;
  projectId: number;
  action: LabelAction;
}): Promise<types.QueryResponse<T> | null> {
  const ctx = await loadPermissionContext({ actorUserId, projectId });

  if (!(await canDo("LABELS", action, ctx))) {
    return failResponse<T>(labelsForbiddenMsg(action), "FORBIDDEN");
  }
  return null; // allowed
}

// LABELS
export function listsForbiddenMsg(action: ListAction): string {
  switch (action) {
    case "READ":
      return "Only project members (or the project manager) can view lists for this project.";
    case "CREATE":
      return "Only project members (or the project manager) can create lists for this project.";
    case "UPDATE":
      return "Only project members (or the project manager) can update lists for this project.";
    case "DELETE":
      return "Only project members (or the project manager) can delete lists for this project.";
    case "MOVE":
      return "Only project members (or the project manager) can move lists for this project.";

    default:
      return "You don’t have permission to perform this action on lists.";
  }
}

export async function guardListAction<T>({
  actorUserId,
  projectId,
  action,
}: {
  actorUserId: number;
  projectId: number;
  action: ListAction;
}): Promise<types.QueryResponse<T> | null> {
  const ctx = await loadPermissionContext({ actorUserId, projectId });

  if (!(await canDo("LIST", action, ctx))) {
    return failResponse<T>(listsForbiddenMsg(action), "FORBIDDEN");
  }
  return null; // allowed
}

// TASKS
export function tasksForbiddenMsg(action: TaskAction): string {
  switch (action) {
    case "READ":
      return "Only project members (or the project manager) can view tasks in this project.";
    case "CREATE":
      return "Only project members (or the project manager) can create tasks in this project.";
    case "MOVE":
      return "Only project members (or the project manager) can move tasks in this project.";
    case "UPDATE":
      return "Only the task author (or the project manager) can update this task.";
    case "DELETE":
      return "Only the task author (or the project manager) can delete this task.";
    case "MANAGE_ASSIGNEES":
      return "Only the task author (or the project manager) can manage assignees for this task.";
    default:
      return "You don’t have permission to perform this action on tasks.";
  }
}

export async function guardTaskAction<T>({
  actorUserId,
  action,
  projectId,
  listId,
  taskId,
}: {
  actorUserId: number;
  action: TaskAction;
  projectId?: number;
  listId?: number;
  taskId?: number; // for READ/MOVE/UPDATE/DELETE/MANAGE_ASSIGNEES
}): Promise<types.QueryResponse<T> | null> {
  // Build context
  const ctx = await loadPermissionContext({
    actorUserId,
    projectId: projectId ?? null,
    listId: listId ?? null,
    taskId: taskId ?? null,
  });

  if (!(await canDo("TASK", action, ctx))) {
    return failResponse<T>(tasksForbiddenMsg(action), "FORBIDDEN");
  }
  return null; // allowed
}

// COMMENTS
export function commentsForbiddenMsg(action: CommentAction): string {
  switch (action) {
    case "READ":
      return "Only project members (or the project manager) can view comments in this project.";
    case "CREATE":
      return "Only project members (or the project manager) can add comments in this project.";
    case "UPDATE":
      return "Only the comment author can update this comment.";
    case "DELETE":
      return "Only the comment author (or the project manager) can delete this comment.";
    default:
      return "You don’t have permission to perform this action on comments.";
  }
}

export async function guardCommentAction<T>({
  actorUserId,
  action,
  taskId,
  commentId,
}: {
  actorUserId: number;
  action: CommentAction;
  taskId?: number;
  commentId?: number;
}): Promise<types.QueryResponse<T> | null> {
  const ctx = await loadPermissionContext({
    actorUserId,
    taskId: taskId ?? null,
    commentId: commentId ?? null,
  });

  if (!(await canDo("COMMENT", action, ctx))) {
    return failResponse<T>(commentsForbiddenMsg(action), "FORBIDDEN");
  }
  return null; // allowed
}
