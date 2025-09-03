"use client";

import ProjectHeading from "@/components/projects/project-heading";
import { BreadCrumbsSkeleton, ProjectHeadingSkeleton } from "@/components/skeletons/skeletons";
import { useProjects } from "@/hooks/use-projects";
import { notFound, useParams } from "next/navigation";

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const { project, isProjectLoading, projectError } = useProjects(projectId);

  if (isProjectLoading) {
    return (
      <div className="space-y-6">
        <BreadCrumbsSkeleton />
        <ProjectHeadingSkeleton />
      </div>
    );
  }

  if (projectError) {
    throw new Error(projectError?.message || "Unable to load project.");
  }

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <ProjectHeading project={project} />
      {children}
    </div>
  );
}
