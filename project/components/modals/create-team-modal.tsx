"use client";

import { FC, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUIStore } from "@/stores/ui-store";
import { LoadingButtonContent } from "../ui/loading-button-content";

type TeamForm = z.infer<typeof teamSchemaForm>;

const CreateTeamModal: FC = () => {
  const { user } = useUser();
  const { isCreateTeamModalOpen, setCreateTeamModalOpen } = useUIStore();
  const { createTeam, isTeamCreateLoading } = useTeams({});

  const form = useForm<TeamForm>({
    resolver: zodResolver(teamSchemaForm),
    defaultValues: { teamName: "", description: "" },
    mode: "onSubmit",
  });

  // Reset the form every time the modal closes
  useEffect(() => {
    if (!isCreateTeamModalOpen) {
      form.reset({ teamName: "", description: "" });
    }
  }, [isCreateTeamModalOpen, form]);

  if (!user) return null;

  const onSubmit = async (values: TeamForm) => {
    const result = await checkTeamNameUnique(values.teamName);

    if (!result.success || (result.success && !result.data)) {
      form.setError("teamName", { type: "manual", message: result.message });
      return;
    }
    await createTeam({ teamName: values.teamName, description: values.description });

    setCreateTeamModalOpen(false);
  };

  return (
    <Dialog open={isCreateTeamModalOpen} onOpenChange={setCreateTeamModalOpen}>
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Create a New Team</DialogTitle>
          <DialogDescription className="sr-only">
            Create a team to collaborate with members on projects and tasks.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Team Name */}
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

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      id="teamDescription"
                      placeholder="Briefly describe this team (scope, responsibilities, etc.)"
                      className="min-h-[100px] resize-y max-h-[300px]"
                      {...field}
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
                onClick={() => setCreateTeamModalOpen(false)}
                disabled={isTeamCreateLoading}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isTeamCreateLoading}>
                <LoadingButtonContent isLoading={isTeamCreateLoading} displayText="Create" />
              </Button>
            </DialogFooter>
          </form>
        </Form>

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
