"use client";
import { projectSchemaUpdateForm } from "@/lib/validations/validations";
import { ProjectUpdateForm } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, Check } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { useProjects } from "@/hooks/use-projects";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { formatDate } from "@/lib/utils";
import { LoadingButtonContent } from "../ui/loading-button-content";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { projectStatusColor } from "@/lib/utils";

type ProjectGeneralSettingsProps = {
  project_id: number;
};

type ProjectStatus = keyof typeof projectStatusColor;
const STATUS_OPTIONS = Object.keys(projectStatusColor) as ProjectStatus[];

export function ProjectGeneralSettings({ project_id }: ProjectGeneralSettingsProps) {
  const { project, updateProject, isProjectUpdateLoading } = useProjects(project_id);
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [isStatusOpen, setStatusOpen] = useState(false);

  const form = useForm<ProjectUpdateForm>({
    resolver: zodResolver(projectSchemaUpdateForm),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      dueDate: project?.dueDate ?? new Date(),
      status: project?.status ?? "Planning",
    },
    mode: "onSubmit",
  });

  function onSubmit(values: ProjectUpdateForm) {
    updateProject({ project_id, projectFormData: values });
  }

  // Reset form when project data changes (or opens)
  useEffect(() => {
    form.reset({
      name: project?.name ?? "",
      description: project?.description ?? "",
      dueDate: project?.dueDate ?? null,
      status: project?.status ?? "Planning",
    });
  }, [form, project]);

  return (
    <div className="flex flex-col gap-2">
      {/* Section Title and Description */}
      <p className="text-xl">General</p>
      <p className="text-sm text-muted-foreground">Update general project settings</p>
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
                const value = field.value ?? null;
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
                          onSelect={(d) => field.onChange(d ?? null)}
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

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => {
                const current = field.value as ProjectStatus | undefined;
                const isDisabled = isProjectUpdateLoading;

                return (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Popover open={isStatusOpen} onOpenChange={setStatusOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isDisabled}
                          className={`w-full justify-between ${!current ? "text-muted-foreground" : ""}`}
                        >
                          {current ? (
                            <span className="flex items-center gap-2 text-foreground">
                              <Badge className={projectStatusColor[current]}>{current}</Badge>
                            </span>
                          ) : (
                            "Select a status"
                          )}

                          <span className="ml-2 h-4 w-4 opacity-0" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent align="start" className="w-56 p-1">
                        <ul role="menu" aria-label="Project status" className="space-y-1">
                          {STATUS_OPTIONS.map((status) => {
                            const selected = current === status;
                            return (
                              <li key={status}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    field.onChange(status);
                                    setStatusOpen(false);
                                  }}
                                  disabled={isDisabled}
                                  role="menuitemradio"
                                  aria-checked={selected}
                                  className={`w-full flex items-center justify-between rounded-sm px-2 py-1.5 text-sm
                                              hover:bg-black/10 dark:hover:bg-white/10 ${selected ? "font-medium bg-black/10 dark:bg-white/10" : ""}`}
                                >
                                  <span className="flex items-center gap-2">
                                    <Badge className={projectStatusColor[status]}>{status}</Badge>
                                  </span>
                                  {selected ? <Check size={14} /> : null}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
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
