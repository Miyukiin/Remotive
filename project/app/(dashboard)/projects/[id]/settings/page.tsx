"use client";
import { use } from "react";
import { useProjects } from "@/hooks/use-projects";
import LoadingUI from "@/components/ui/loading-ui";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ProjectGeneralSettings } from "@/components/projects/project-general-settings";

export default function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // Unwrap the promise as per Nextjs 15 recommendation
  const projectId = Number(id);
  const { project, isProjectLoading, projectError } = useProjects(projectId);

  if (!project) {
    if (!project && isProjectLoading) {
      return <LoadingUI />;
    }
    throw new Error(projectError?.message);
  }

  return (
    <div className="flex flex-col gap-12">
      {/* General Settings */}
      <ProjectGeneralSettings project_id={projectId} />

      {/* Danger Settings */}
      <div className="flex flex-col gap-2">
        <p className="text-xl">Danger Zone</p>
        <div className="p-4 border-[1px] border-destructive/50 rounded-md">
          <div className="flex items-center gap-3 text-foreground text-sm">
            <div>
              <p className="font-medium"> Delete Project </p>
              <p className="font-light"> This project will be permanently deleted.</p>
            </div>

            <Button
              onClick={() => {}}
              // disabled={isTeamDeleteLoading}
              variant="destructive"
              className="text-xs h-max"
            >
              {/* {isTeamDeleteLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                "Delete team"
              )} */}
              Delete Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
