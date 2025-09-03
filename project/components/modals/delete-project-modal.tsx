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
import { useProjects } from "@/hooks/use-projects";

type DeleteProjectModalProps = { project_id: number };

export function DeleteProjectModal({ project_id }: DeleteProjectModalProps) {
  const { isDeleteProjectModalOpen, setDeleteProjectModalOpen } = useUIStore();
  const { deleteProject, isProjectDeleteLoading } = useProjects(project_id);

  function onCancelClick() {
    setDeleteProjectModalOpen(false);
  }

  async function onDeleteClick() {
    deleteProject(project_id);
  }
  return (
    <AlertDialog open={isDeleteProjectModalOpen} onOpenChange={setDeleteProjectModalOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
        </AlertDialogHeader>
        <p className="text-sm text-muted-foreground">
          This action cannot be undone. All lists, comments, and tasks will be lost forever!
        </p>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={onCancelClick} disabled={isProjectDeleteLoading}>
              Cancel
            </Button>
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={onDeleteClick} disabled={isProjectDeleteLoading}>
              <LoadingButtonContent isLoading={isProjectDeleteLoading} displayText="Delete" />
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
