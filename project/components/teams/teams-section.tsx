"use client";
import { FC, useMemo, useState } from "react";
import TeamsSearchFilter from "./teams-search-filter";
import TeamsGrid from "./teams-grid";
import { ProjectsFilterOptions, TeamsSelect } from "@/types";
import StateBlock from "@/components/ui/state-block";

type TeamsProps = {
  teamsData: TeamsSelect[]; 
};

const TeamsSection: FC<TeamsProps> = ({ teamsData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState<ProjectsFilterOptions>("Ascending (A-Z)");

  const filteredTeams = useMemo(() => {
    let filtered = [...teamsData];

    // Filter by search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((team) => team.teamName.toLowerCase().includes(q));
    }

    // Sort based on filterOption
    switch (filterOption) {
      case "Ascending (A-Z)":
        filtered.sort((a, b) => a.teamName.localeCompare(b.teamName));
        break;
      case "Descending (Z-A)":
        filtered.sort((a, b) => b.teamName.localeCompare(a.teamName));
        break;
      case "Newest First":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "Oldest First":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
    }

    return filtered;
  }, [searchTerm, filterOption, teamsData]);

  // Empty teams
  if (teamsData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="mb-4">
          <TeamsSearchFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterOption={filterOption as ProjectsFilterOptions}
            setFilterOption={setFilterOption}
          />
        </div>
        <StateBlock
          title="You are not in any teams right now."
          description="Create one or get invited to an existing team."
        />
      </div>
    );
  }

  // Empty query result
  if (filteredTeams.length === 0) {
    return (
      <div className="space-y-4">
        <div className="mb-4">
          <TeamsSearchFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterOption={filterOption as ProjectsFilterOptions}
            setFilterOption={setFilterOption}
          />
        </div>
        <StateBlock
          title="No teams found."
          description="Try a different name or clear your filters."
        />
      </div>
    );
  }

  // Data grid
  return (
    <div>
      <div className="mb-4">
        <TeamsSearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterOption={filterOption as ProjectsFilterOptions}
          setFilterOption={setFilterOption}
        />
      </div>
      <TeamsGrid teamsData={filteredTeams} />
    </div>
  );
};

export default TeamsSection;
