"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTaskStore } from "@/stores/task-store";
import { TaskUpdateForm, TaskSelect } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { taskSchemaEditForm } from "../../../lib/validations/validations";
import { useTasks } from "@/hooks/use-tasks";
import { LoadingButtonContent } from "@/components/ui/loading-button-content";

type TaskNameProps = {
  activeTask: TaskSelect;
  project_id: number;
};

export function TaskName({ activeTask, project_id }: TaskNameProps) {
  const { isEditingTaskName, setisEditingTaskName } = useTaskStore();
  const { updateTaskNew, isUpdateTaskNewLoading } = useTasks({ task_id: activeTask.id });

  const form = useForm<TaskUpdateForm>({
    resolver: zodResolver(taskSchemaEditForm),
    defaultValues: {
      title: activeTask.title,
    },
  });

  async function onSubmit(values: TaskUpdateForm) {
    await updateTaskNew({ task_id: activeTask.id, project_id, taskFormData: values });
    setisEditingTaskName(false);
  }

  if (isEditingTaskName) {
    return (
      <div className="flex flex-col md:flex-row gap-3">
        <Form {...form}>
          <form id="task-title-form" className="block w-full" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} disabled={isUpdateTaskNewLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
          <div className="flex gap-3 mt-0 md:mt-0.5 justify-center items-start">
            <Button form="task-title-form" type="submit" size="sm" variant="save" disabled={isUpdateTaskNewLoading}>
              <LoadingButtonContent isLoading={isUpdateTaskNewLoading} displayText="Save" />
            </Button>
            <Button
              onClick={() => setisEditingTaskName(false)}
              size="sm"
              variant="secondary"
              disabled={isUpdateTaskNewLoading}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center min-w-0 w-full">
        <Tooltip>
          <TooltipTrigger className="w-full">
            <h1 className="text-2xl text-start w-full font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              {activeTask.title}
            </h1>
          </TooltipTrigger>
          <TooltipContent>{activeTask.title}</TooltipContent>
        </Tooltip>
      </div>
      <Button onClick={() => setisEditingTaskName(true)} size="sm" variant="outline">
        Edit
      </Button>
    </div>
  );
}
