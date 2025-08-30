"use client";

import { FC, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MultiSelect from "../ui/multi-select";
import { LoadingButtonContent } from "@/components/ui/loading-button-content";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { useTasks } from "@/hooks/use-tasks";
import { useProjectMembers } from "@/hooks/use-projects";
import { useUIStore } from "@/stores/ui-store";

import { taskSchemaForm } from "@/lib/validations/validations";
import { priorityTuple } from "@/lib/db/db-enums";
import { capitalize } from "@/lib/utils";

import { useTaskStore } from "@/stores/task-store";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { formatDate } from "@/lib/utils";
import { TaskCreateForm } from "@/types";
import { QuillEditor } from "../ui/rich-text-editor";

type CreateTaskModalProps = {
  list_id: number;
  project_id: number;
  position: number;
};

const CreateTaskModal: FC<CreateTaskModalProps> = ({ list_id, project_id, position }) => {
  const { isCreateTaskModalOpen, setCreateTaskModalOpen } = useUIStore();
  const { setListToAddTo } = useTaskStore();
  const [isCalendarOpen, setCalendarOpen] = useState(false);

  const form = useForm<TaskCreateForm>({
    resolver: zodResolver(taskSchemaForm),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      priority: undefined, // let user pick
      assigneeIds: [],
      dueDate: null,
    },
    mode: "onSubmit",
  });

  // Reset form when dialog opens to ensure fresh state
  useEffect(() => {
    if (isCreateTaskModalOpen) {
      form.reset({
        title: "",
        description: "",
        content: "",
        priority: undefined,
        assigneeIds: [],
        dueDate: null,
      });
    }
  }, [isCreateTaskModalOpen, form]);

  const { createTask, isCreateTaskLoading } = useTasks({ list_id });
  const { projectMembers, isProjectMembersLoading, projectMembersError } = useProjectMembers(project_id);

  const onSubmit = async (values: TaskCreateForm) => {
    await createTask({ list_id, project_id, position, taskFormData: values });
    setCreateTaskModalOpen(false);
    setListToAddTo(null);
  };

  return (
    <Dialog open={isCreateTaskModalOpen} onOpenChange={setCreateTaskModalOpen}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task name" disabled={isCreateTaskLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      value={field.value ?? ""} // textarea can't take null
                      onChange={(e) => field.onChange(e.target.value)}
                      className="scrollbar-custom resize-y max-h-[100px] min-h-[100px]"
                      placeholder="A short description of what your task is about."
                      disabled={isCreateTaskLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content */}
            {/* <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      value={field.value ?? ""} // textarea can't take null
                      onChange={(e) => field.onChange(e.target.value)}
                      className="resize-y max-h-[150px] min-h-[100px]"
                      placeholder="The content of your task."
                      disabled={isCreateTaskLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <Controller
              name="content"
              control={form.control}
              render={({ field }) => (
                <QuillEditor
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="Content of your task."
                  className="scrollbar-custom overflow-y-scroll max-h-[150px] min-h-[100px]"
                />
              )}
            />

            {/* Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority *</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(v) => field.onChange(v)}
                      disabled={isCreateTaskLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isCreateTaskLoading ? "Loading..." : "Select"} />
                      </SelectTrigger>
                      <SelectContent align="start">
                        {priorityTuple.map((value) => (
                          <SelectItem key={value} value={value}>
                            {capitalize(value)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Assignees */}
            <FormField
              control={form.control}
              name="assigneeIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Members</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={(projectMembers ?? []).map((m) => ({ label: m.name, value: m.id }))}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      disabled={isProjectMembersLoading || isCreateTaskLoading}
                      placeholder={isProjectMembersLoading ? "Loading project members..." : "Select Members to Assign"}
                      emptyText={
                        projectMembersError ? "Failed to load members" : "This project doesn't have any members yet."
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Due Date */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => {
                const value = field.value ?? null; // Date | null
                const isDisabled = isCreateTaskLoading;

                return (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <Popover open={isCalendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isDisabled}
                          className={`w-full justify-between ${!value ? "text-muted-foreground" : ""}`}
                        >
                          {value ? formatDate(value) : "Pick a date"}
                          <CalendarIcon className="ml-2 h-4 w-4 opacity-60" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="p-0">
                        <Calendar
                          mode="single"
                          selected={value ?? undefined}
                          // Set null when user unselects via ESC, etc.
                          onSelect={(d) => field.onChange(d ?? null)}
                          // Only today & future:
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const cmp = new Date(date);
                            cmp.setHours(0, 0, 0, 0);
                            return cmp < today;
                          }}
                          initialFocus
                        />

                        <div className="flex gap-2 justify-between p-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => field.onChange(null)}
                            disabled={isDisabled || !value}
                          >
                            Clear
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setCalendarOpen(false)}>
                            Close
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCreateTaskModalOpen(false)}
                disabled={isCreateTaskLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreateTaskLoading}>
                <LoadingButtonContent isLoading={isCreateTaskLoading} displayText="Create Task" />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;
