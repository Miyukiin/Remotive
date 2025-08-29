import { useUIStore } from "@/stores/ui-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { LoadingButtonContent } from "../ui/loading-button-content";
import { useTeams } from "@/hooks/use-teams";
import { redirect } from "next/navigation";

type DeleteTeamModalProps = { team_id: number };

export function DeleteTeamModal({ team_id }: DeleteTeamModalProps) {
  const { isDeleteTeamModalOpen, setDeleteTeamModalOpen } = useUIStore();
  const { deleteTeam, isTeamDeleteLoading} = useTeams(team_id);

  function onCancelClick() {
    setDeleteTeamModalOpen(false);
  }

  async function onDeleteClick() {
    try {
      await deleteTeam(team_id);
      setDeleteTeamModalOpen(false);
      redirect("/teams");
    } catch {
      // Catch the error thrown by deleteTeam, this try catch prevents redirects since execution doesn't get that far.
    }
  }
  return (
    <AlertDialog open={isDeleteTeamModalOpen} onOpenChange={setDeleteTeamModalOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this Team?</AlertDialogTitle>
        </AlertDialogHeader>
        <p className="text-sm text-muted-foreground">This action cannot be undone. Your team will be lost forever!</p>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="secondary" onClick={onCancelClick} disabled={isTeamDeleteLoading}>
              Cancel
            </Button>
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={onDeleteClick} disabled={isTeamDeleteLoading}>
              <LoadingButtonContent isLoading={isTeamDeleteLoading} displayText="Delete" />
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
