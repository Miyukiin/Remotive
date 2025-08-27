"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { LoadingButtonContent } from "@/components/ui/loading-button-content";

import { useTasks } from "@/hooks/use-tasks";
import { TaskUpdateForm, TaskSelect } from "@/types";
import { taskSchemaEditForm } from "../../../lib/validations/validations";

type TaskDescriptionProps = {
  activeTask: TaskSelect;
  project_id: number;
};

export function TaskDescription({ activeTask, project_id }: TaskDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { updateTaskNew, isUpdateTaskNewLoading } = useTasks({ task_id: activeTask.id });

  const form = useForm<TaskUpdateForm>({
    resolver: zodResolver(taskSchemaEditForm),
    defaultValues: {
      description: activeTask.description ?? "",
    },
  });

  async function onSubmit(values: TaskUpdateForm) {
    // normalize empty string -> null to satisfy your DB schema
    const normalized: Partial<TaskUpdateForm> = {
      description: values.description && values.description.trim() !== "" ? values.description.trim() : null,
    };

    await updateTaskNew({
      task_id: activeTask.id,
      project_id,
      taskFormData: normalized,
    });

    setIsEditing(false);
  }

  function onCancel() {
    form.reset({ description: activeTask.description ?? "" });
    setIsEditing(false);
  }

  if (isEditing) {
    const descVal = form.watch("description") ?? "";
    return (
      <div className="flex flex-col gap-3 mt-3 ml-2">
        <Form {...form}>
          <form id="task-description-form" className="block w-full space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      disabled={isUpdateTaskNewLoading}
                      placeholder="Add a short description (max 200 chars)…"
                      className="text-xs md:text-base min-h-24 resize-none max-h-24"
                    />
                  </FormControl>
                  <div className="flex items-center justify-between">
                    <FormMessage />
                    <span className="text-xs text-muted-foreground">{(descVal ?? "").length}/200</span>
                    <div className="flex gap-3 mt-0 md:mt-0.5 justify-center items-start">
                      <button
                        form="task-description-form"
                        type="submit"
                        className="shrink-0 text-xs underline text-primary hover:no-underline cursor-pointer"
                        disabled={isUpdateTaskNewLoading}
                      >
                        <LoadingButtonContent
                          isLoading={isUpdateTaskNewLoading}
                          displayText="Save"
                          loaderSize={12}
                        />
                      </button>
                      <button
                        onClick={onCancel}
                        className="shrink-0 text-xs underline text-primary hover:no-underline cursor-pointer"
                        disabled={isUpdateTaskNewLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 mt-3 ml-2">
      <div className="flex items-center min-w-0 w-full">
        <p className="text-sm w-full whitespace-nowrap overflow-hidden text-ellipsis text-muted-foreground">
          {activeTask.description ? activeTask.description : "No Description Yet"}
        </p>
      </div>
      <div className="w-full flex">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="shrink-0 text-xs underline text-primary hover:no-underline cursor-pointer"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
