"use client";
import { FC, useMemo, useState } from "react";
import ProjectsSearchFilter from "./projects-search-filter";
import ProjectsGrid from "./project-grid";
import { ProjectSelect, ProjectsFilterOptions } from "@/types";
import StateBlock from "@/components/ui/state-block";
import { CreateProjectButton } from "@/components/projects/create-project-button";

type ProjectsSectionProps = {
  projectsData: ProjectSelect[];
};

const ProjectsSection: FC<ProjectsSectionProps> = ({ projectsData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] =
    useState<ProjectsFilterOptions>("Ascending (A-Z)");

  const filteredProjects = useMemo(() => {
    let filtered = [...projectsData];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
    }

    switch (filterOption) {
      case "Ascending (A-Z)":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Descending (Z-A)":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "Newest First":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "Oldest First":
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
    }
    return filtered;
  }, [searchTerm, filterOption, projectsData]);

  // No projects yet
  if (projectsData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="mb-4">
          <ProjectsSearchFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterOption={filterOption}
            setFilterOption={setFilterOption}
          />
        </div>
        <StateBlock
          title="You have no projects right now."
          description="Create one or get invited to an existing team."
        />
      </div>
    );
  }

  // No results for current search
  if (filteredProjects.length === 0) {
    return (
      <div className="space-y-4">
        <div className="mb-4">
          <ProjectsSearchFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterOption={filterOption}
            setFilterOption={setFilterOption}
          />
        </div>
        <StateBlock
          title="No projects found."
          description="Try a different name or clear your filters."
        />
      </div>
    );
  }

  // Normal grid
  return (
    <div>
      <div className="mb-4">
        <ProjectsSearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterOption={filterOption}
          setFilterOption={setFilterOption}
        />
      </div>
      <ProjectsGrid projects={filteredProjects} />
    </div>
  );
};

export default ProjectsSection;
