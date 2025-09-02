import { failResponse } from "@/lib/db/queries/query_utils";
import { loadPermissionContext } from "./permission-loaders";
import { canDo, TeamAction } from "./permissions";
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
