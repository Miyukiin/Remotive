"use client";
import { projectSchemaUpdateForm } from "@/lib/validations/validations";
import { ProjectUpdateForm } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { useProjects } from "@/hooks/use-projects";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { formatDate } from "@/lib/server-utils";
import { LoadingButtonContent } from "../ui/loading-button-content";
import { Separator } from "../ui/separator";

type ProjectGeneralSettingsProps = {
  project_id: number;
};

export function ProjectGeneralSettings({ project_id }: ProjectGeneralSettingsProps) {
  const { project, updateProject, isProjectUpdateLoading } = useProjects(project_id);
  const [isCalendarOpen, setCalendarOpen] = useState(false);

  const form = useForm<ProjectUpdateForm>({
    resolver: zodResolver(projectSchemaUpdateForm),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      dueDate: project?.dueDate ?? new Date(),
    },
    mode: "onSubmit",
  });

  function onSubmit(values: ProjectUpdateForm) {
    updateProject({ project_id, projectFormData: values });
  }

  // Reset form when page mounts to ensure fresh state
  useEffect(() => {
    form.reset({
      name: project?.name,
      description: project?.description,
      dueDate: project?.dueDate,
    });
  }, [form, project]);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xl">General</p>
      <Separator className="mb-4" />
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" disabled={isProjectUpdateLoading} {...field} />
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
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter project description"
                      disabled={isProjectUpdateLoading}
                      value={field.value ?? ""}
                      onChange={field.onChange}
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
                const isDisabled = isProjectUpdateLoading;

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
            <div className="flex justify-end">
              <Button type="submit" variant="save" disabled={isProjectUpdateLoading}>
                <LoadingButtonContent isLoading={isProjectUpdateLoading} displayText="Update" />
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
