"use client";
import ProjectHeading from "@/components/projects/project-heading";
import LoadingUI from "@/components/ui/loading-ui";
import { useProjects } from "@/hooks/use-projects";
import { useParams } from "next/navigation";

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const { project, isProjectLoading, projectError } = useProjects(projectId);

  if (!project) {
    if (!project && isProjectLoading) {
      return <LoadingUI />;
    }
    throw new Error(projectError?.message);
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <ProjectHeading project={project} />
      {children}
    </div>
  );
}
