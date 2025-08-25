import { useUIStore } from "@/stores/ui-store";
import { Drawer, DrawerTitle, DrawerContent } from "@/components/ui/drawer";
import { FC, useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "../ui/button";
import { Calendar, Ellipsis, Flame, Loader, Settings, Tag, Users } from "lucide-react";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { capitalize, useScreenWidth, projectStatusColor, taskPriorityColor } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

import dynamic from "next/dynamic";
import { useTaskStore } from "@/stores/task-store";
import { TaskName } from "../tasks/task-modal-ui/task-name";

const DynamicRichTextEditor = dynamic(() => import("../ui/rich-text-editor"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

const TaskDetailsModal: FC<{ project_id: number }> = ({ project_id }) => {
  const { isTaskDetailsModalOpen, setTaskDetailsModalOpen } = useUIStore();
  const { activeTask } = useTaskStore();

  const screenWidth = useScreenWidth();
  const isMobile = screenWidth ? (screenWidth < 768 ? true : false) : false;

  const [isEditingContent, setIsEditingContent] = useState(false);

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
          {/* Task Details */}
          <div className={`mt-4 grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} grid-rows-1 gap-3`}>
            {/* Assignees */}
            <div>
              <div className="flex items-center justify-between text-dark-grey-300 dark:text-white-smoke-200 hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/10 py-1 px-2 rounded-sm">
                <div className="flex items-center gap-2 text-inherit">
                  <Users size={16} />
                  <p className="text-sm font-medium"> Assignees </p>
                </div>
                <Settings size={16} />
              </div>
              {/* Assigned Members */}
              <div className="mt-1 flex flex-col gap-2 ml-8">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src="https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zMHVGZXExRll1cENQdEY5amg1YkhMdUU2TDEifQ" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <p className="flex gap-2">
                    <span className="text-foreground text-xs">Jhack Concha</span>{" "}
                    <span className="text-muted-foreground text-xs">Task Owner </span>{" "}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src="https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zMHVGZXExRll1cENQdEY5amg1YkhMdUU2TDEifQ" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <p className="text-foreground text-xs">James Reeves</p>
                </div>
              </div>
            </div>

            {/* Labels */}
            <div>
              <div className="flex items-center justify-between text-dark-grey-300 dark:text-white-smoke-200 hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/10 py-1 px-2 rounded-sm">
                <div className="flex items-center gap-2 text-inherit">
                  <Tag size={16} />
                  <p className="text-sm font-medium"> Labels </p>
                </div>
                <Settings size={16} />
              </div>
              {/* Assigned Labels */}
              <div className="mt-1 flex flex-wrap gap-1 ml-8">
                {" "}
                {/* CRUD Labels, with color picker */}
                <Badge>Late </Badge>
                <Badge>Frontend </Badge>
                <Badge>Documentation </Badge>
              </div>
            </div>
            {/* Status */}
            <div>
              <div className="flex items-center justify-between text-dark-grey-300 dark:text-white-smoke-200 hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/10 py-1 px-2 rounded-sm">
                <div className="flex items-center gap-2 text-inherit">
                  <Loader size={16} />
                  <p className="text-sm font-medium"> Status </p>
                </div>
                <Settings size={16} />
              </div>
              <div className="mt-1 flex gap-1 ml-8">
                <Badge className={`${projectStatusColor["Completed"]}`}>Completed</Badge>{" "}
                {/*Temporary, should source name and color from the list columns */}
              </div>
            </div>
            {/* Priority */}
            <div>
              <div className="flex items-center justify-between text-dark-grey-300 dark:text-white-smoke-200 hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/10 py-1 px-2 rounded-sm">
                <div className="flex items-center gap-2 text-inherit">
                  <Flame size={16} />
                  <p className="text-sm font-medium"> Priority </p>
                </div>
                <Settings size={16} />
              </div>
              <div className="mt-1 flex gap-1 ml-8">
                <Badge className={`${taskPriorityColor["medium"]}`}>{capitalize("medium")}</Badge>
              </div>
            </div>
            {/* Due Date */}
            <div>
              <div className="flex items-center justify-between text-dark-grey-300 dark:text-white-smoke-200 hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/10 py-1 px-2 rounded-sm">
                <div className="flex items-center gap-2 text-inherit">
                  <Calendar size={16} />
                  <p className="text-sm font-medium"> Due Date </p>
                </div>
                <Settings size={16} />
              </div>
              <div className="mt-1 flex gap-1 ml-8">
                <p className="text-foreground text-xs">August 1, 2025</p>
              </div>
            </div>
            {/* Created at Date */}
            <div>
              <div className="flex items-center justify-between text-dark-grey-300 dark:text-white-smoke-200 hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/10 py-1 px-2 rounded-sm">
                <div className="flex items-center gap-2 text-inherit">
                  <Calendar size={16} />
                  <p className="text-sm font-medium"> Created </p>
                </div>
                <Settings size={16} />
              </div>
              <div className="mt-1 flex gap-1 ml-8">
                <p className="text-foreground text-xs">July 25, 2025</p>
              </div>
            </div>
          </div>

          <Separator className="my-5" />
          {/* Description of Task */}
          <div className="flex w-full gap-3">
            {" "}
            {!isMobile && (
              <Avatar className="w-12 h-12">
                <AvatarImage src="https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zMHVGZXExRll1cENQdEY5amg1YkhMdUU2TDEifQ" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            )}
            <div className="w-full rounded-md border border-green/400 dark:border-green-200/10">
              <div className="flex justify-between items-center gap-2 px-3 py-2 border-b border-green/400 dark:border-green-200/10">
                <div className="flex items-center gap-2">
                  {isMobile && (
                    <Avatar className="w-6 h-6">
                      <AvatarImage src="https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zMHVGZXExRll1cENQdEY5amg1YkhMdUU2TDEifQ" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  )}
                  <p className="text-sm">
                    <span className="font-medium">jrconcha-strat</span> opened 4 days ago ·{" "}
                    <span className="font-medium">jrconcha-strat</span>{" "}
                  </p>
                </div>
                {/* Dropdown for Editing. Should replace text content with a rich text editor. */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Ellipsis />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setIsEditingContent(true)}>Edit</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Text Content. This would be Render React Markdown styled with Prose */}
              <div className="p-3 w-full">
                {isEditingContent ? (
                  <DynamicRichTextEditor />
                ) : (
                  <p className="justify-evenly text-sm">
                    {" "}
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                    culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus
                    error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo
                    inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam
                    voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos
                    qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit
                    amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et
                    dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem
                    ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum
                    iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui
                    dolorem eum fugiat quo voluptas nulla pariatur?
                  </p>
                )}
              </div>
            </div>
          </div>

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
                <DynamicRichTextEditor />
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
