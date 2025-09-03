"use client";

import { FC, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import MultiSelect from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";
import { LoadingButtonContent } from "@/components/ui/loading-button-content";

import { useUIStore } from "@/stores/ui-store";
import type { ReassignTeamsForm, TeamsSelect } from "@/types";
import { reassignTeamsSchema } from "@/lib/validations/validations";
import { useProjectMembers } from "@/hooks/use-projects";

type ReassignProjectTeamsModalProps = {
  project_id: number;
  /** All selectable teams */
  allTeams: TeamsSelect[];
  /** Currently assigned team ids for this project */
  currentTeamIds: number[];
};

const ReassignProjectTeamsModal: FC<ReassignProjectTeamsModalProps> = ({
  project_id,
  allTeams,
  currentTeamIds,
}) => {
  const { isReassignProjectTeamsModalOpen, setReassignProjectTeamsModalOpen } = useUIStore();
  const { reassignProjectTeams, isReassignProjectTeamsLoading } = useProjectMembers(project_id);

  const form = useForm<ReassignTeamsForm>({
    resolver: zodResolver(reassignTeamsSchema),
    defaultValues: { teamIds: currentTeamIds },
    mode: "onSubmit",
  });

  // Reset form each time it opens
  useEffect(() => {
    if (isReassignProjectTeamsModalOpen) {
      form.reset({ teamIds: currentTeamIds });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReassignProjectTeamsModalOpen, currentTeamIds.join(",")]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const selectedTeamIds = form.watch("teamIds") ?? [];

  // Compute diffs, e.g which teams to add and teams to remove...
  const { toAdd, toRemove } = useMemo(() => {
    const selected = new Set(selectedTeamIds);
    const current = new Set(currentTeamIds);
    const add: number[] = [];
    const rem: number[] = [];
    for (const id of selected) if (!current.has(id)) add.push(id);
    for (const id of current) if (!selected.has(id)) rem.push(id);
    return { toAdd: add, toRemove: rem };
  }, [selectedTeamIds, currentTeamIds]);

  const onSubmit = async () => {
    await reassignProjectTeams({
      project_id,
      toAdd,
      toRemove,
    });
    setReassignProjectTeamsModalOpen(false);
  };

  return (
    <Dialog open={isReassignProjectTeamsModalOpen} onOpenChange={setReassignProjectTeamsModalOpen}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Manage Project Teams</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="teamIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Teams *</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={allTeams.map((t) => ({ label: t.teamName, value: t.id }))}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      disabled={isReassignProjectTeamsLoading}
                      placeholder={allTeams.length ? "Select teams" : "No teams available"}
                      emptyText="No teams found."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Diff preview */}
            <div className="flex items-center gap-2 text-sm">
              {!!toAdd.length && (
                <div className="flex items-start gap-2">
                  <span className="text-primary">Adding:</span>
                  <div className="flex flex-wrap gap-1">
                    {toAdd.map((id) => {
                      const t = allTeams.find((x) => x.id === id);
                      return (
                        <Badge key={`add-${id}`} variant="secondary">
                          {t?.teamName ?? id}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {!!toRemove.length && (
                <div className="flex items-start gap-2">
                  <span className="text-destructive">Removing:</span>
                  <div className="flex flex-wrap gap-1">
                    {toRemove.map((id) => {
                      const t = allTeams.find((x) => x.id === id) ?? { teamName: "Unknown" };
                      return (
                        <Badge key={`rem-${id}`} variant="outline">
                          {t.teamName}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setReassignProjectTeamsModalOpen(false)}
                disabled={isReassignProjectTeamsLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isReassignProjectTeamsLoading}>
                <LoadingButtonContent isLoading={isReassignProjectTeamsLoading} displayText="Save Changes" />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReassignProjectTeamsModal;
