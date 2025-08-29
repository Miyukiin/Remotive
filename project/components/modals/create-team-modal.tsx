"use client";

import { FC, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Loader2, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import { teamSchemaForm } from "@/lib/validations/validations";
import { checkTeamNameUnique } from "@/actions/teams-actions";
import { useTeams } from "@/hooks/use-teams";

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
import { Input } from "@/components/ui/input";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUIStore } from "@/stores/ui-store";

const CreateTeamModal: FC = () => {
  const { user } = useUser();
  const { isCreateTeamModalOpen, setCreateTeamModalOpen } = useUIStore();
  const { createTeam, isTeamCreateLoading } = useTeams();

  const form = useForm<z.infer<typeof teamSchemaForm>>({
    resolver: zodResolver(teamSchemaForm),
    defaultValues: { teamName: "" },
  });

  // Reset the form every time the modal closes
  useEffect(() => {
    if (!isCreateTeamModalOpen) {
      form.reset({ teamName: "" });
    }
  }, [isCreateTeamModalOpen, form]);

  if (!user) return null;

  const onSubmit = async (values: z.infer<typeof teamSchemaForm>) => {
    const result = await checkTeamNameUnique(values.teamName);

    // If uniqueness check failed or team name is not unique
    if (!result.success || (result.success && !result.data)) {
      form.setError("teamName", { type: "manual", message: result.message });
      return;
    }

    await createTeam(values.teamName);
    setCreateTeamModalOpen(false);
  };

  return (
    <Dialog open={isCreateTeamModalOpen} onOpenChange={setCreateTeamModalOpen}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Create a New Team</DialogTitle>
          <DialogDescription className="sr-only">
            Create a team to collaborate with members on projects and tasks.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="teamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input id="teamName" placeholder="e.g. Platform Team" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>

              <Button type="submit" disabled={isTeamCreateLoading}>
                {isTeamCreateLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create Team"
                )}
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

export default CreateTeamModal;
