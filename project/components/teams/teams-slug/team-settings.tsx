import { Separator } from "@/components/ui/separator";
import { TeamsSelect } from "@/types";
import { FC } from "react";
import TeamName from "../team-name";
import { Button } from "@/components/ui/button";
import { Loader2Icon, Trash } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";

type TeamSettingsProps = {
  team: TeamsSelect;
};

const TeamSettings: FC<TeamSettingsProps> = ({ team }) => {
  const { isDeleteTeamModalOpen, setDeleteTeamModalOpen } = useUIStore();

  function onDeleteClick() {
    setDeleteTeamModalOpen(true);
  }

  return (
    <>
      {/* General Settings */}
      <div className="flex flex-col gap-2">
        <p className="text-xl">General</p>
        <Separator className="mb-4" />
        <TeamName teamData={team} />
      </div>
      {/* Danger Settings */}
      <div className="flex flex-col gap-2">
        <p className="text-xl">Danger Zone</p>
        <p className="text-sm text-muted-foreground">Tread carefully, traveller</p>
        <Separator className="mb-4" />
        <div className="p-4 border-[1px] border-destructive/50 rounded-md">
          <div className="flex flex-col gap-3 text-foreground text-sm">
            <div>
              <p className="font-medium"> Delete Team </p>
              <p className="font-light"> This team will be permanently deleted.</p>
            </div>
            <div>
              <Button onClick={onDeleteClick} disabled={isDeleteTeamModalOpen} variant="destructive">
                {isDeleteTeamModalOpen ? (
                  <div className="flex gap-2 items-center ">
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                    Loading
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Team
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamSettings;
