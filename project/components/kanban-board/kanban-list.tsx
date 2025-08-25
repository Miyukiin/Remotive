"use client";
import { FC, useMemo, useState } from "react";
import KanbanListOptions from "./kanban-list-options";
import { ListSelect, TaskSelect } from "@/types";
import CreateTaskModal from "../modals/create-task-modal";
import TaskCard from "../tasks/task-card";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DragButton } from "../ui/drag-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CircleCheck } from "lucide-react";
import { listColor } from "@/lib/utils";

type KanbanListProps = {
  tasks: TaskSelect[];
  list: ListSelect;
  project_id: number;
  searchTerm: string;
};

const KanbanList: FC<KanbanListProps> = ({ tasks, list, project_id, searchTerm }) => {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const task_ids = useMemo(() => tasks.map((l) => l.id), [tasks]);
  const isDoneColumn = list.isDone;

  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter((task) => task.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return filtered;
  }, [searchTerm, tasks]);

  function openModal() {
    setCreateModalOpen(true);
  }

  const { setNodeRef, listeners, attributes, transform, transition, isDragging } = useSortable({
    id: list.id,
    data: {
      type: "list",
      list,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="min-w-[80px] min-h-[350px] w-80 overflow-y shrink-0 opacity-80 dark:opacity-45 "
      >
        <div
          className={` bg-list-bg min-h-[350px] h-full rounded-lg border border-border ${isDragging ? "ring-2 ring-emerald-50" : ""}`}
        ></div>
      </div>
    );
  }

  return (
    <>
      {isCreateModalOpen && tasks && (
        <CreateTaskModal
          isModalOpen={isCreateModalOpen}
          setIsModalOpen={setCreateModalOpen}
          list_id={list.id}
          project_id={project_id}
          position={tasks.length}
        />
      )}
      <div ref={setNodeRef} style={style} className="min-w-[80px] min-h-[350px] w-80 overflow-y shrink-0">
        <div className="bg-list-bg min-h-[350px] h-full rounded-lg border border-border ">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-1 justify-between min-w-0">
              <div className="flex gap-3 items-center min-w-0 flex-1">
                <DragButton listeners={listeners} attributes={attributes} />
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  {isDoneColumn && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="shrink-0">
                          <CircleCheck size={14} className="text-green-600 dark:text-green-300" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Any tasks dragged to this column will be marked as done.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <div className="min-w-0 flex-1 truncate">
                    {/* Title and Description */}
                    <p className="min-w-0 font-semibold text-foreground text-sm truncate flex-1">{list.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{list.description}</p>
                  </div>
                  {/* Colored Position */}
                  <div className="flex items-center">
                    <span className={`shrink-0 px-2 py-1 text-xs rounded-full ${listColor[list.color]}`}>
                      {list.position}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <KanbanListOptions project_id={project_id} list={list} isDone={isDoneColumn} />
              </div>
            </div>
          </div>

          {/* Scrollable Task Content */}
          <SortableContext items={task_ids} strategy={verticalListSortingStrategy}>
            <div className="min-h-[400px]">
              <div className="scrollbar-custom flex flex-col p-4 mb-4 space-y-3 min-h-[400px] max-h-[400px] overflow-y-auto">
                {filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} list_id={list.id} project_id={project_id} />
                ))}
              </div>
            </div>
          </SortableContext>

          <button
            type="button"
            onClick={openModal}
            className="w-full p-3 rounded-lg text-foreground/50 hover:bg-primary/15 dark:hover:bg-primary/8 hover:text-primary transition-colors"
          >
            + Add task
          </button>
        </div>
      </div>
    </>
  );
};

export default KanbanList;
