"use client";
import CreateProjectModal from "@/components/modals/create-project-modal";
import { CreateProjectButton } from "@/components/projects/create-project-button";
import ProjectsSection from "@/components/projects/projects-section";
import { useProjects } from "@/hooks/use-projects";

export default function ProjectsPage() {
  const { projects } = useProjects();

  return (
    <>
      <CreateProjectModal />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground mt-2">Manage and organize your team projects</p>
          </div>
          <CreateProjectButton />
        </div>

        {/* Projects Section */}
        {projects ? (
          <ProjectsSection projectsData={projects} />
        ) : (
          <div className="flex justify-center">
            <p className="text-muted-foreground"> Unable to get project data. Please refresh the page.</p>{" "}
          </div>
        )}
      </div>
    </>
  );
}
