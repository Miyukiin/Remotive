"use client";

import { FC, useEffect, useMemo } from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { addMembersSchemaForm } from "@/lib/validations/validations";
import { useUsers } from "@/hooks/use-users";
import { useTeams } from "@/hooks/use-teams";

import MultiSelect from "../ui/multi-select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUIStore } from "@/stores/ui-store";
import { LoadingButtonContent } from "../ui/loading-button-content";
import { X } from "lucide-react";

type AddTeamMembersModalProps = {
  team_id: number;
};

const AddTeamMembersModal: FC<AddTeamMembersModalProps> = ({ team_id }) => {
  const { isAddMemberModalOpen, setAddMemberModalOpen } = useUIStore();
  const form = useForm<z.infer<typeof addMembersSchemaForm>>({
    resolver: zodResolver(addMembersSchemaForm),
    defaultValues: { user_Ids: [] },
  });

  const { users, isUsersLoading, getUsersError } = useUsers();
  const { addUsersToTeam, isAddingUsersToTeamLoading, teamMembers } = useTeams({team_id});

  // Member ids in the team
  const memberIds = useMemo(() => new Set((teamMembers ?? []).map((m) => m.id)), [teamMembers]);

  // Users that are not already members
  const availableUsers = useMemo(() => (users ?? []).filter((u) => !memberIds.has(u.id)), [users, memberIds]);

  // Reset form each time dialog closes
  useEffect(() => {
    if (!isAddMemberModalOpen) form.reset({ user_Ids: [] });
  }, [isAddMemberModalOpen, form]);

  if (getUsersError) {
    throw new Error("Unable to retrieve users data.");
  }

  const onSubmit = async (values: z.infer<typeof addMembersSchemaForm>) => {
    await addUsersToTeam({ user_ids: values.user_Ids, team_id });
    setAddMemberModalOpen(false);
  };

  return (
    <Dialog open={isAddMemberModalOpen} onOpenChange={setAddMemberModalOpen}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(e) => {
          // Prevent focusing the dialog itself; let the multiselect manage focus.
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Add Members To Team</DialogTitle>
          <DialogDescription className="sr-only">Select one or more users to add as team members.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_Ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Members</FormLabel>
                  <FormControl>
                    <div>
                      <MultiSelect
                        options={(availableUsers ?? []).map((u) => ({ label: u.name, value: u.id }))}
                        value={field.value ?? []}
                        onChange={field.onChange}
                        disabled={isUsersLoading || isAddingUsersToTeamLoading}
                        placeholder={isUsersLoading ? "Loading users…" : "Select users to add"}
                        emptyText={isUsersLoading ? "Loading users…" : "No more users to add"}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isAddingUsersToTeamLoading}
                onClick={() => setAddMemberModalOpen(false)}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isAddingUsersToTeamLoading}>
                <LoadingButtonContent isLoading={isAddingUsersToTeamLoading} displayText="Add Members" />
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {/* Optional top-right close icon */}
        <DialogClose
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default AddTeamMembersModal;
