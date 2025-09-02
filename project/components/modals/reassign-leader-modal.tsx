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

type ReassignLeaderModalProps = {
  team_id: number;
  new_leader_id: number;
  current_leader_id: number;
  reAssignLeader: (args: { old_leader_id: number; new_leader_id: number; team_id: number }) => void;
  isReassignLoading: boolean;
};

const ReassignLeaderModal: FC<ReassignLeaderModalProps> = ({
  team_id,
  new_leader_id,
  current_leader_id,
  reAssignLeader,
  isReassignLoading,
}) => {
  const { isReassignLeaderModalOpen, setReassignLeaderModalOpen } = useUIStore();
  const handleSubmit = () => {
    reAssignLeader({
      old_leader_id: current_leader_id,
      new_leader_id,
      team_id,
    });
    setReassignLeaderModalOpen(false);
  };

  return (
    <Dialog open={isReassignLeaderModalOpen} onOpenChange={setReassignLeaderModalOpen}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        {/* Optional close icon */}
        <DialogClose
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </DialogClose>

        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            <DialogTitle>Are you sure?</DialogTitle>
          </div>
          <DialogDescription>
            This member will become the new Team Leader. You’ll lose leader privileges after reassignment.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setReassignLeaderModalOpen(false)}
            disabled={isReassignLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isReassignLoading}>
            <LoadingButtonContent isLoading={isReassignLoading} displayText="Confirm" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReassignLeaderModal;
