"use client";

import { FC } from "react";
import { Filter, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectsFilterOptions } from "@/types";
import { projectsFilterOptions } from "@/lib/utils";

type ProjectsSearchFilterProps = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterOption: ProjectsFilterOptions;
  setFilterOption: (value: ProjectsFilterOptions) => void;
};

const ProjectsSearchFilter: FC<ProjectsSearchFilterProps> = ({
  searchTerm,
  setSearchTerm,
  filterOption,
  setFilterOption,
}) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search projects..."
          className="pl-10"
          aria-label="Search projects"
        />
      </div>

      {/* Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="justify-start sm:justify-center">
            <Filter className="mr-2 h-4 w-4" />
            <span className="truncate">
              Filter by: <span className="font-medium">{filterOption}</span>
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Sort</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={filterOption}
            onValueChange={(val) => setFilterOption(val as ProjectsFilterOptions)}
          >
            {projectsFilterOptions.map((option) => (
              <DropdownMenuRadioItem key={option} value={option}>
                {option}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProjectsSearchFilter;
