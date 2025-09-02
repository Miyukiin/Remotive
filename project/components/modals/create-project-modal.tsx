"use client";

import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import MultiSelect from "@/components/ui/multi-select";
import { LoadingButtonContent } from "@/components/ui/loading-button-content";

import { useProjects } from "@/hooks/use-projects";
import { useTeams } from "@/hooks/use-teams";
import { checkProjectNameUnique } from "@/actions/project-actions";

import { projectSchemaForm } from "@/lib/validations/validations";
import { ProjectCreateForm } from "@/types";
import { useUIStore } from "@/stores/ui-store";
import { formatDate } from "@/lib/utils";

const CreateProjectModal: FC = () => {
  const { isCreateProjectModalOpen, setCreateProjectModalOpen } = useUIStore();
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const form = useForm<ProjectCreateForm>({
    resolver: zodResolver(projectSchemaForm),
    defaultValues: {
      name: "",
      description: "",
      dueDate: null,
      teamIds: [],
    },
    mode: "onSubmit",
  });

  // Fresh state each time it opens
  useEffect(() => {
    if (isCreateProjectModalOpen) {
      form.reset({
        name: "",
        description: "",
        dueDate: null,
        teamIds: [],
      });
    }
  }, [isCreateProjectModalOpen, form]);

  const { createProject, isProjectCreationLoading } = useProjects();
  const { userTeams, isUserTeamsLoading, getUserTeamsError } = useTeams({});

  const onSubmit = async (values: ProjectCreateForm) => {
    // Server-side uniqueness check
    const unique = await checkProjectNameUnique(values.name);
    if (!unique.success || (unique.success && !unique.data)) {
      form.setError("name", { type: "manual", message: unique.message });
      return;
    }

    await createProject(values);
    setCreateProjectModalOpen(false);
  };

  return (
    <Dialog open={isCreateProjectModalOpen} onOpenChange={setCreateProjectModalOpen}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" disabled={isProjectCreationLoading} {...field} />
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
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="Project description"
                      className="resize-y min-h-[100px] max-h-[150px]"
                      disabled={isProjectCreationLoading}
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
                const isDisabled = isProjectCreationLoading;

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

            {/* Teams */}
            <FormField
              control={form.control}
              name="teamIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Teams *</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={(userTeams ?? []).map((t) => ({ label: t.teamName, value: t.id }))}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      disabled={isUserTeamsLoading || isProjectCreationLoading}
                      placeholder={isUserTeamsLoading ? "Loading teams..." : "Select teams"}
                      emptyText={getUserTeamsError ? "Failed to load teams" : "You are not in any teams."}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateProjectModalOpen(false)}
                disabled={isProjectCreationLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isProjectCreationLoading}>
                <LoadingButtonContent isLoading={isProjectCreationLoading} displayText="Create Project" />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
