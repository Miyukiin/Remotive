// components/modals/reassign-manager-modal.tsx
"use client";

import { FC } from "react";
import { Crown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { LoadingButtonContent } from "../ui/loading-button-content";
import { useUIStore } from "@/stores/ui-store";
import { useProjectManagerStore } from "@/stores/project-manager-store";
import { ProjectRoles } from "@/types";

type ReassignManagerModalProps = {
  isLoading: boolean;
  onRoleChange: (userId: number, role: ProjectRoles) => void;
};

const ReassignManagerModal: FC<ReassignManagerModalProps> = ({ isLoading, onRoleChange }) => {
  const { isReassignManagerModalOpen, setReassignManagerModalOpen } = useUIStore();
  const { pendingProjectManager, setPendingProjectManager } = useProjectManagerStore(); // PendingProjectManager to update

  const handleSubmit = () => {
    console.log(pendingProjectManager)
    console.log(onRoleChange);
    if (!pendingProjectManager) return;
    onRoleChange?.(pendingProjectManager.userId, pendingProjectManager.role);
    setPendingProjectManager(null);
    setReassignManagerModalOpen(false);
  };

  const handleClose = () => {
    setPendingProjectManager(null);
    setReassignManagerModalOpen(false);
  };

  return (
    <Dialog open={isReassignManagerModalOpen} onOpenChange={setReassignManagerModalOpen}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogClose
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </DialogClose>

        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            <DialogTitle>Make this user Project Manager?</DialogTitle>
          </div>
          <DialogDescription>
            This will set them as the project’s sole Project Manager. You will lose PM privileges in this project and become a project member!
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} variant="destructive">
            <LoadingButtonContent isLoading={isLoading} displayText="Confirm" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReassignManagerModal;
