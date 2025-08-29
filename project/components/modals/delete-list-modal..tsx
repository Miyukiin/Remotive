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
import { useLists } from "@/hooks/use-lists";
import { useKanbanStore } from "@/stores/kanban-store";

type DeleteKanbanModalProps = { project_id: number };

export function DeleteKanbanModal({ project_id }: DeleteKanbanModalProps) {
  const { isDeleteKanbanModalOpen, setDeleteKanbanModalOpen } = useUIStore();
  const { deleteList, isListDeleteLoading } = useLists(project_id);
  const { listToDelete } = useKanbanStore();

  function onCancelClick() {
    setTimeout(() => (document.body.style.pointerEvents = ""), 500); // Fix to unable to click after modal close. https://github.com/shadcn-ui/ui/issues/468
    setDeleteKanbanModalOpen(false);
  }

  async function onDeleteClick() {
    if (!listToDelete) throw new Error("Unable to find list to delete.");
    await deleteList({ project_id, list_id: listToDelete.id });
    setTimeout(() => (document.body.style.pointerEvents = ""), 500); // Fix to unable to click after modal close. https://github.com/shadcn-ui/ui/issues/468
    setDeleteKanbanModalOpen(false);
  }
  return (
    <AlertDialog open={isDeleteKanbanModalOpen} onOpenChange={setDeleteKanbanModalOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this list?</AlertDialogTitle>
        </AlertDialogHeader>
        <p className="text-sm text-muted-foreground">
          This action cannot be undone. All tasks inside the list will also be deleted forever!
        </p>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="secondary" onClick={onCancelClick} disabled={isListDeleteLoading}>
              Cancel
            </Button>
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={onDeleteClick} disabled={isListDeleteLoading}>
              <LoadingButtonContent isLoading={isListDeleteLoading} displayText="Delete" />
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
