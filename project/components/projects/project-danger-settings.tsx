"use client";

import { useProjects } from "@/hooks/use-projects";
import { Button } from "../ui/button";

import { LoadingButtonContent } from "../ui/loading-button-content";
import { redirect } from "next/navigation";
import { Separator } from "../ui/separator";

type ProjectDangerSettingsProps = {
  project_id: number;
};

export function ProjectDangerSettings({ project_id }: ProjectDangerSettingsProps) {
  const { deleteProject, isProjectDeleteLoading } = useProjects(project_id);

  function onClick() {
    deleteProject(project_id);
    redirect("/projects");
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xl">Danger Zone</p>
      <p className="text-sm text-muted-foreground">Tread carefully, traveller</p>
      <Separator className="mb-4" />
      <div className="p-4 border-[1px] border-destructive/50 rounded-md">
        <div className="flex items-center gap-3 text-foreground text-sm">
          <div>
            <p className="font-medium"> Delete Project </p>
            <p className="font-light"> This project will be permanently deleted.</p>
          </div>

          <Button onClick={onClick} disabled={isProjectDeleteLoading} variant="destructive" className="text-xs h-max">
            <LoadingButtonContent isLoading={isProjectDeleteLoading} displayText="Delete Project" />
          </Button>
        </div>
      </div>
    </div>
  );
}
