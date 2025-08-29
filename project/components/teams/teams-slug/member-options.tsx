"use client";
import { FC } from "react";
import { Button } from "../../ui/button";
import { Crown, EllipsisVertical, UserRoundX } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { useTeams } from "@/hooks/use-teams";
import { useUIStore } from "@/stores/ui-store";

type MemberOptionsProps = {
  team_id: number;
  user_id: number;
  isReassignLoading: boolean;
  setNewLeaderId: (val: number) => void;
};

const MemberOptions: FC<MemberOptionsProps> = ({ team_id, user_id, isReassignLoading, setNewLeaderId }) => {
  const { removeUserFromTeam, isRemoveUserFromTeamLoading } = useTeams();
  const { setReassignLeaderModalOpen } = useUIStore();

  function onRemoveClick() {
    removeUserFromTeam({ user_id, team_id });
  }

  function onAssignClick() {
    setNewLeaderId(user_id);
    setReassignLeaderModalOpen(true);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem disabled={isReassignLoading} variant="default" onClick={onAssignClick}>
          <Crown />
          Assign as Leader
        </DropdownMenuItem>

        <DropdownMenuItem disabled={isRemoveUserFromTeamLoading} variant="destructive" onClick={onRemoveClick}>
          <UserRoundX />
          Remove Member
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MemberOptions;
