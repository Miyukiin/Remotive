import { useUIStore } from "@/stores/ui-store";
import { Drawer, DrawerTitle, DrawerContent } from "@/components/ui/drawer";
import { FC } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
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

const TaskDetailsModal: FC<{ project_id: number }> = ({ project_id }) => {
  const { isTaskDetailsModalOpen, setTaskDetailsModalOpen } = useUIStore();
  const { activeTask } = useTaskStore();

  const screenWidth = useScreenWidth();
  const isMobile = screenWidth ? (screenWidth < 768 ? true : false) : false;

  if (!activeTask) {
    return null; // Should be unable to retrieve active task
  }

  return (
    <Drawer
      open={isTaskDetailsModalOpen}
      onOpenChange={setTaskDetailsModalOpen}
      direction={isMobile ? "bottom" : "right"}
      container={document.querySelector("main")}
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

          {/* Add a comment */}
          <div className="flex w-full gap-3 mt-10">
            {" "}
            {!isMobile && (
              <Avatar className="w-12 h-12">
                <AvatarImage src="https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zMHVGZXExRll1cENQdEY5amg1YkhMdUU2TDEifQ" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            )}
            <div className="w-full space-y-5">
              <div className="flex items-center gap-2">
                {isMobile && (
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zMHVGZXExRll1cENQdEY5amg1YkhMdUU2TDEifQ" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                )}
                <p> Add a comment </p>
              </div>

              <div className="w-full rounded-md border border-green/400 dark:border-green-200/10">
                {/* Text Content. This would be Render React Markdown styled with Prose */}
                {/* <DynamicRichTextEditor /> */}
                <div className="p-3 w-full space-y-2 flex flex-col items-end">
                  <Button variant="save" size="sm">
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TaskDetailsModal;
