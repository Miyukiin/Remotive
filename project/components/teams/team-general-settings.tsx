"use client";

import { FC, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2Icon } from "lucide-react";

import { teamSchemaForm } from "@/lib/validations/validations";
import { TeamsSelect } from "@/types";
import { useTeams } from "@/hooks/use-teams";

type Props = {
  team: TeamsSelect;
};

type TeamForm = z.infer<typeof teamSchemaForm>;

const TeamGeneralSettings: FC<Props> = ({ team }) => {
  const { updateTeam, isTeamUpdateLoading } = useTeams(team.id);

  const form = useForm<TeamForm>({
    resolver: zodResolver(teamSchemaForm),
    defaultValues: {
      teamName: team.teamName ?? "",
      description: team.description ?? "",
    },
    mode: "onSubmit",
  });

  // Keep form in sync if parent `team` changes
  useEffect(() => {
    form.reset({
      teamName: team.teamName ?? "",
      description: team.description ?? "",
    });
  }, [team, form]);

  const onSubmit = (values: TeamForm) => {
    updateTeam({ team_id: team.id, teamFormData: values });
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Section Title and Description */}
      <p className="text-xl">General</p>
      <p className="text-sm text-muted-foreground">Update your team’s name and description</p>
      <Separator className="mb-4" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Team Name */}
          <FormField
            control={form.control}
            name="teamName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Name *</FormLabel>
                <FormControl>
                  <Input
                    id="teamName"
                    placeholder="e.g. Platform Team"
                    autoComplete="off"
                    disabled={isTeamUpdateLoading}
                    {...field}
                  />
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
                    disabled={isTeamUpdateLoading}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isTeamUpdateLoading}>
              {isTeamUpdateLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Updating…
                </span>
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TeamGeneralSettings;
