import { useUIStore } from "@/stores/ui-store";
import { Drawer, DrawerTitle, DrawerContent } from "@/components/ui/drawer";
import { FC } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "../ui/button";
import { useScreenWidth } from "@/lib/client-utils";
import { Separator } from "../ui/separator";

import { useTaskStore } from "@/stores/task-store";
import { TaskName } from "../tasks/task-modal-ui/task-name";
import { TaskDue } from "../tasks/task-modal-ui/task-due";
import { TaskCreated } from "../tasks/task-modal-ui/task-created";
import { TaskPriority } from "../tasks/task-modal-ui/task-priority";
import { TaskStatus } from "../tasks/task-modal-ui/task-status";
import { TaskAssignees } from "../tasks/task-modal-ui/task-assignees";
import { TaskContent } from "../tasks/task-modal-ui/task-content";
import { TaskDescription } from "../tasks/task-modal-ui/task-description";
import { TaskLabels } from "../tasks/task-modal-ui/task-labels";
import { FileQuestion } from "lucide-react";
import { TaskComments } from "../tasks/task-modal-ui/task-comments";

const TaskDetailsModal: FC<{ project_id: number }> = ({ project_id }) => {
  const { isTaskDetailsModalOpen, setTaskDetailsModalOpen } = useUIStore();
  const { activeTask } = useTaskStore();

  const screenWidth = useScreenWidth();
  const isMobile = screenWidth ? (screenWidth < 768 ? true : false) : false;

  const container = typeof window !== "undefined" ? (document.querySelector("main") ?? undefined) : undefined;

  // If no active task, render an empty state **inside** the Drawer
  if (!activeTask) {
    return (
      <Drawer
        open={isTaskDetailsModalOpen}
        onOpenChange={setTaskDetailsModalOpen}
        direction={isMobile ? "bottom" : "right"}
        container={container}
        handleOnly={!isMobile}
      >
        <VisuallyHidden>
          <DrawerTitle>Task details</DrawerTitle>
        </VisuallyHidden>
        <DrawerContent aria-describedby={undefined} className="max-w-[600px]! xl:max-w-[800px]!">
          <div className="flex min-h-60 h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="rounded-full border p-3 text-muted-foreground">
              <FileQuestion className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold">No task selected</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              We couldn’t load the active task. Open a task from the board to view its details.
            </p>
            <div className="mt-2 flex gap-2">
              <Button variant="secondary" onClick={() => setTaskDetailsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Drawer
      open={isTaskDetailsModalOpen}
      onOpenChange={setTaskDetailsModalOpen}
      direction={isMobile ? "bottom" : "right"}
      container={container}
      handleOnly={isMobile ? false : true}
    >
      <VisuallyHidden>
        <DrawerTitle> Title</DrawerTitle>
      </VisuallyHidden>
      <DrawerContent aria-describedby={undefined} className="max-w-[600px]! xl:max-w-[800px]!">
        <div className="p-6 w-full overflow-y-auto">
          {/* Task Title and Editing */}
          <TaskName activeTask={activeTask} project_id={project_id} />
          {/* Task Description and Editing */}
          <TaskDescription activeTask={activeTask} project_id={project_id} />
          {/* Task Details */}
          <div className={`mt-4 grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} grid-rows-1 gap-3`}>
            {/* Assignees */}
            <TaskAssignees activeTask={activeTask} project_id={project_id} />
            {/* Labels */}
            <TaskLabels activeTask={activeTask} project_id={project_id} />
            {/* Status */}
            <TaskStatus activeTask={activeTask} project_id={project_id} />
            {/* Priority */}
            <TaskPriority activeTask={activeTask} project_id={project_id} />
            {/* Due Date */}
            <TaskDue activeTask={activeTask} project_id={project_id} />
            {/* Created at Date */}
            <TaskCreated activeTask={activeTask} />
          </div>

          <Separator className="my-5" />
          {/* Content of Task */}
          <TaskContent activeTask={activeTask} isMobile={isMobile} project_id={project_id} />

          <Separator className="my-5" />
          {/* Comment Section */}
          <TaskComments activeTask={activeTask} isMobile={isMobile} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TaskDetailsModal;
