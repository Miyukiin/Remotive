"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis } from "lucide-react";
import { TaskSelect, TaskUpdateForm } from "@/types";
import { useTasks } from "@/hooks/use-tasks";
import { formatDate, initials } from "@/lib/server-utils";
import { QuillEditor } from "@/components/ui/rich-text-editor";
import { LoadingButtonContent } from "@/components/ui/loading-button-content";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchemaEditForm } from "@/lib/validations/validations";
import { ContentRenderer } from "./content-renderer";
import { calculateDaysPassed } from "@/lib/utils";

type TaskContentProps = {
  activeTask: TaskSelect;
  isMobile: boolean;
  project_id: number;
};

export function TaskContent({ activeTask, isMobile, project_id }: TaskContentProps) {
  const [isEditingContent, setIsEditingContent] = useState(false);
  const { daysAgo } = calculateDaysPassed(activeTask.createdAt);

  const {
    taskCreator: taskCreatorObject,
    updateTaskNew,
    isUpdateTaskNewLoading,
  } = useTasks({
    task_id: activeTask.id,
  });

  const taskCreator = taskCreatorObject;

  const form = useForm<TaskUpdateForm>({
    resolver: zodResolver(taskSchemaEditForm),
    defaultValues: { content: activeTask.content ?? "" },
  });

  async function onSubmit(values: TaskUpdateForm) {
    await updateTaskNew({
      task_id: activeTask.id,
      project_id,
      taskFormData: { content: values.content },
    });
    setIsEditingContent(false);
  }

  function onCancel() {
    form.reset({ content: activeTask.content ?? "" });
    setIsEditingContent(false);
  }

  return (
    <div className="flex w-full gap-3">
      {!isMobile && (
        <Avatar className="w-12 h-12">
          <AvatarImage src={taskCreator?.image_url} />
          <AvatarFallback className="text-sm">{initials(taskCreator?.name)}</AvatarFallback>
        </Avatar>
      )}

      <div className="w-full rounded-md border border-emerald-900/40 dark:border-emerald-400/20">
        {/* Header row */}
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-emerald-100/30 dark:bg-emerald-400/20 rounded-t-md border-emerald-900/40 dark:border-emerald-400/20">
          <div className="flex items-center gap-2 flex-1 basis-0 min-w-0 ">
            {isMobile && (
              <Avatar className="w-6 h-6">
                <AvatarImage src={taskCreator?.image_url} />
                <AvatarFallback className="text-sm">{initials(taskCreator?.name)}</AvatarFallback>
              </Avatar>
            )}

            <div className="flex-1 basis-0 min-w-0 overflow-hidden">
              <div className="flex items-center gap-2 min-w-0">
                <p className="text-xs font-medium truncate min-w-0">{taskCreator?.name}</p>
                {!isMobile && (
                  <>
                    <span className="font-light text-xs text-foreground/40 shrink-0">|</span>
                    <span className="font-light text-xs text-foreground/70 shrink-0">
                      {daysAgo === 0
                        ? "just opened today"
                        : daysAgo >= 1 && daysAgo <= 7
                          ? `opened ${daysAgo} ${daysAgo === 1 ? "day" : "days"} ago`
                          : `opened on ${formatDate(activeTask.createdAt)}`}
                    </span>
                  </>
                )}
              </div>

              <p className="text-xs text-muted-foreground truncate min-w-0">{taskCreator?.email}</p>

              {isMobile && (
                <span className="font-light text-xs text-foreground/70 shrink-0">
                  {daysAgo === 0
                    ? "just opened today"
                    : daysAgo >= 1 && daysAgo <= 7
                      ? `opened ${daysAgo} ${daysAgo === 1 ? "day" : "days"} ago`
                      : `opened on ${formatDate(activeTask.createdAt)}`}
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditingContent(true)}>Edit</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 w-full">
          {isEditingContent ? (
            <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)} id="task-content-form">
              <Controller
                name="content"
                control={form.control}
                render={({ field }) => (
                  <QuillEditor
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Write task details…"
                    className="min-h-40"
                  />
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onCancel}
                  disabled={isUpdateTaskNewLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="save" disabled={isUpdateTaskNewLoading}>
                  <LoadingButtonContent isLoading={isUpdateTaskNewLoading} displayText="Save" />
                </Button>
              </div>
            </form>
          ) : activeTask.content ? (
            <ContentRenderer content={activeTask.content} />
          ) : (
            <p className="text-muted-foreground">No Content Yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
