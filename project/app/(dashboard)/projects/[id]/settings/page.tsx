"use client";
import { use } from "react";
import { useProjects } from "@/hooks/use-projects";
import { ProjectGeneralSettings } from "@/components/projects/project-general-settings";
import { ProjectDangerSettings } from "@/components/projects/project-danger-settings";
import { ProjectLabelSettings } from "@/components/projects/project-label-settings";
import LoadingUINoHeader from "@/components/ui/loading-ui-no-header";

export default function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // Unwrap the promise as per Nextjs 15 recommendation
  const projectId = Number(id);
  const { project, isProjectLoading, projectError } = useProjects(projectId);

  if (!project) {
    if (!project && isProjectLoading) {
      return <LoadingUINoHeader />;
    }
    throw new Error(projectError?.message);
  }

  return (
    <div className="flex flex-col gap-12">
      {/* General Settings */}
      <ProjectGeneralSettings project_id={projectId} />

      {/* Label Settings */}
      <ProjectLabelSettings project_id={projectId} />

      {/* Danger Settings */}
      <ProjectDangerSettings project_id={projectId}/>
      
    </div>
  );
}
