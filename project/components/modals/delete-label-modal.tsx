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
import { useLabels } from "@/hooks/use-labels";
import { LoadingButtonContent } from "../ui/loading-button-content";
import { useLabelStore } from "@/stores/labels-store";

type DeleteLabelModalProps = { project_id: number };

export function DeleteLabelModal({ project_id }: DeleteLabelModalProps) {
  const { isDeleteLabelModalOpen, setDeleteLabelModalOpen } = useUIStore();
  const { deleteLabel, isLabelDeletionLoading } = useLabels({ project_id });
  const { labelToDelete } = useLabelStore();

  function onCancelClick() {
    setTimeout(() => (document.body.style.pointerEvents = ""), 500); // Fix to unable to click after modal close. https://github.com/shadcn-ui/ui/issues/468
    setDeleteLabelModalOpen(false);
  }

  async function onDeleteClick() {
    if (!labelToDelete) throw new Error("Unable to find label to delete.");
    await deleteLabel({label_id: labelToDelete.id, project_id});
    setTimeout(() => (document.body.style.pointerEvents = ""), 500); // Fix to unable to click after modal close. https://github.com/shadcn-ui/ui/issues/468
    setDeleteLabelModalOpen(false);
  }
  return (
    <AlertDialog open={isDeleteLabelModalOpen} onOpenChange={setDeleteLabelModalOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this label?</AlertDialogTitle>
        </AlertDialogHeader>
        <p className="text-sm text-muted-foreground">
          This action cannot be undone. Tasks using this label will lose the association.
        </p>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onCancelClick} disabled={isLabelDeletionLoading}>
              Cancel
            </Button>
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={onDeleteClick} disabled={isLabelDeletionLoading}>
              <LoadingButtonContent isLoading={isLabelDeletionLoading} displayText="Delete" />
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
