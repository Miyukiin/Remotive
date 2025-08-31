"use client";

import { Button } from "../ui/button";

import { Separator } from "../ui/separator";
import { Loader2Icon, Trash } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { DeleteProjectModal } from "../modals/delete-project-modal";

type ProjectDangerSettingsProps = {
  project_id: number;
};

export function ProjectDangerSettings({ project_id }: ProjectDangerSettingsProps) {
  const { isDeleteProjectModalOpen, setDeleteProjectModalOpen } = useUIStore();

  function onClick() {
    setDeleteProjectModalOpen(true);
  }

  return (
    <>
      <DeleteProjectModal project_id={project_id} />

      <div className="flex flex-col gap-2">
        <p className="text-xl">Danger Zone</p>
        <p className="text-sm text-muted-foreground">Tread carefully, traveller</p>
        <Separator className="mb-4" />
        <div className="p-4 border-[1px] border-destructive/50 rounded-md">
          <div className="flex flex-col gap-3 text-foreground text-sm">
            <div>
              <p className="font-medium"> Delete Project </p>
              <p className="font-light"> This project will be permanently deleted.</p>
            </div>
            <div>
              <Button onClick={onClick} disabled={isDeleteProjectModalOpen} variant="destructive">
                {isDeleteProjectModalOpen ? (
                  <div className="flex gap-2 items-center">
                    <Loader2Icon className={`animate-spin`} /> Loading
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Project
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
