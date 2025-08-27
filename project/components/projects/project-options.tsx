"use client";
import { FC } from "react";
import { Button } from "../ui/button";
import { EllipsisVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { redirect } from "next/navigation";

type ProjectOptionsProps = {
  project_id: number;
};

const ProjectOptions: FC<ProjectOptionsProps> = ({ project_id }) => {
  function onClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault();
    e.stopPropagation(); // Prevent clicks on dropdown from redirecting to the project card slug page.
    redirect(`/projects/${project_id}/settings`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <DropdownMenuItem variant="default" onClick={(e) => onClick(e)}>
          View Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProjectOptions;
