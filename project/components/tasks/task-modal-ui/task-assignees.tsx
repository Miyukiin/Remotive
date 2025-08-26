"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Users, Settings, Loader2 } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import MultiSelect from "@/components/ui/multi-select";

import { useTasks } from "@/hooks/use-tasks";
import { useProjectMembers } from "@/hooks/use-projects";
import type { TaskEditFormInput, TaskEditFormOutput, TaskSelect } from "@/types";
import { initials } from "@/lib/server-utils";

type TaskAssigneesProps = {
  activeTask: TaskSelect;
  project_id: number;
};

export function TaskAssignees({ activeTask, project_id }: TaskAssigneesProps) {
  const [open, setOpen] = useState(false);

  // Fetch project members to populate the selector
  const { projectMembers, isProjectMembersLoading, projectMembersError } = useProjectMembers(project_id);

  // Task-level data: current members and update action
  const { taskMembers, updateTaskNew, isUpdateTaskNewLoading, isTaskLoading } = useTasks({
    task_id: activeTask.id,
  });

  // RHF just for the assigneeIds field
  const { control, handleSubmit, reset } = useForm<TaskEditFormInput, undefined, TaskEditFormOutput>({
    defaultValues: {
      assigneeIds: taskMembers?.map((m) => m.id) ?? [],
    },
  });

  // Keep form in sync when popover opens or when taskMembers refresh
  useEffect(() => {
    if (open) {
      reset({ assigneeIds: taskMembers?.map((m) => m.id) ?? [] });
    }
  }, [open, taskMembers, reset]);

  const pmOptions =
    (projectMembers ?? []).map((m) => ({
      label: m.name,
      value: m.id,
      imageUrl: m.image_url,
    })) ?? [];

  const assigned = useMemo(
    () =>
      (taskMembers ?? []).map((m) => ({
        id: m.id,
        name: m.name,
        imageUrl: m.image_url,
      })),
    [taskMembers],
  );

  const onSubmit = async (values: TaskEditFormOutput) => {
    await updateTaskNew({
      task_id: activeTask.id,
      project_id,
      taskFormData: { assigneeIds: values.assigneeIds !== undefined ? values.assigneeIds : [] },
    });
    setOpen(false);
  };

  return (
    <div>
      {/* Header row (trigger) */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={isUpdateTaskNewLoading || isTaskLoading}
            className="flex w-full items-center justify-between text-dark-grey-300 dark:text-white-smoke-200
                       hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/10
                       py-1 px-2 rounded-sm"
          >
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span className="text-sm font-medium">Assignees</span>
            </div>
            <Settings size={16} />
          </button>
        </PopoverTrigger>

        {/* Popover content */}
        <PopoverContent align="start" className="w-72 h-full p-3">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="text-xs text-muted-foreground">Select members to assign</div>

            <Controller
              name="assigneeIds"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  options={pmOptions.map((o) => ({ label: o.label, value: o.value }))}
                  value={field.value ?? []}
                  onChange={field.onChange}
                  disabled={isProjectMembersLoading || isUpdateTaskNewLoading || isTaskLoading}
                  placeholder={isProjectMembersLoading ? "Loading project members..." : "Select Members"}
                  emptyText={
                    projectMembersError ? "Failed to load members" : "This project doesn't have any members yet."
                  }
                />
              )}
            />

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={isUpdateTaskNewLoading || isTaskLoading}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isUpdateTaskNewLoading || isTaskLoading}>
                {isUpdateTaskNewLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                  </span>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>

      {/* Assigned Members list (read-only preview) */}
      <div className="mt-1 ml-8 flex flex-col gap-2">
        {assigned.length ? (
          assigned.map((m) => (
            <div key={m.id} className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                {m.imageUrl ? <AvatarImage src={m.imageUrl} alt={m.name} /> : null}
                <AvatarFallback className="text-[10px]">{initials(m.name)}</AvatarFallback>
              </Avatar>
              <p className="text-foreground text-xs">{m.name}</p>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-xs">No assignees yet</p>
        )}
      </div>
    </div>
  );
}
