"use client";

import CreateProjectModal from "@/components/modals/create-project-modal";
import { CreateProjectButton } from "@/components/projects/create-project-button";
import ProjectsSection from "@/components/projects/projects-section";
import { ProjectsSectionSkeleton } from "@/components/projects/projects-sections-skeleton";
import StateBlock from "@/components/ui/state-block";
import { useProjects } from "@/hooks/use-projects";

export default function ProjectsPage() {
  const { projects, isProjectsLoading, projectsError } = useProjects();

  return (
    <>
      <CreateProjectModal />
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground mt-2">
              Manage and organize your team projects
            </p>
          </div>
          <CreateProjectButton />
        </div>

        {isProjectsLoading ? (
          <div className="min-h-60">
            <ProjectsSectionSkeleton count={6} />
          </div>
        ) : projectsError ? (
          <StateBlock
            title="Unable to get project data."
            description="Please refresh the page or try again later."
            actions={<CreateProjectButton />}
          />
        ) : (
          <ProjectsSection projectsData={projects ?? []} />
        )}
      </div>
    </>
  );
}
