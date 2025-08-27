"use client";

import { useProjects } from "@/hooks/use-projects";
import { Button } from "../ui/button";

import { redirect } from "next/navigation";
import { Separator } from "../ui/separator";
import { Loader2Icon, Trash } from "lucide-react";

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
        <div className="flex flex-col gap-3 text-foreground text-sm">
          <div>
            <p className="font-medium"> Delete Project </p>
            <p className="font-light"> This project will be permanently deleted.</p>
          </div>
          <div>
            <Button onClick={onClick} disabled={isProjectDeleteLoading} variant="destructive">
              {isProjectDeleteLoading ? (
                <div className="flex gap-2 items-center">
                  <Loader2Icon className={`animate-spin`} /> Loading
                </div>
              ) : (
                <div className="flex items-center">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Project
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
