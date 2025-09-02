"use client";
import { FC } from "react";
import { Button } from "../ui/button";
import { CircleQuestionMark, ClipboardCheck, EllipsisVertical, SquarePen, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useLists } from "@/hooks/use-lists";
import { useUIStore } from "@/stores/ui-store";
import { ListSelect } from "@/types";
import { useKanbanStore } from "@/stores/kanban-store";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type KanbanListOptionsProps = {
  project_id: number;
  list: ListSelect;
  isDone: boolean;
};

const KanbanListOptions: FC<KanbanListOptionsProps> = ({ project_id, list, isDone }) => {
  const { updateListsStatus } = useLists(project_id);
  const { setUpdateKanbanModalOpen, setDeleteKanbanModalOpen, isDeleteKanbanModalOpen } = useUIStore();
  const { setActiveList, setListToDelete } = useKanbanStore();

  function onClick() {
    setListToDelete(list);
    setDeleteKanbanModalOpen(true);
  }

  function setAsDone() {
    updateListsStatus({ new_done_list_id: list.id });
  }

  function onEdit() {
    setActiveList(list);
    setUpdateKanbanModalOpen(true);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-secondary-foreground/75 hover:bg-accent hover:text-foreground active:bg-accent active:text-foreground rounded-md "
        >
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          <div className="flex gap-2 items-center">
            <span>Actions </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <CircleQuestionMark size={14} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Done lists cannot be deleted.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={onEdit}>
          <SquarePen /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={setAsDone} disabled={isDone}>
          <ClipboardCheck />
          {isDone ? "Already Marked" : "Mark as Done List"}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={isDeleteKanbanModalOpen || isDone} variant="destructive" onClick={onClick}>
          <Trash />
          {isDone ? "Cannot Delete Done List" : "Delete List"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default KanbanListOptions;
