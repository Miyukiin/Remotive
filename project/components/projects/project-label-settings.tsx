"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useUIStore } from "@/stores/ui-store";
import { LabelCreateModal } from "../modals/label-create-modal";

type Props = { project_id: number };

export function ProjectLabelSettings({ project_id }: Props) {
  const { setCreateLabelModalOpen } = useUIStore();

  function onAddClick() {
    setCreateLabelModalOpen(true);
  }

  return (
    <>
      <LabelCreateModal project_id={project_id}/>
      <div className="flex flex-col gap-2">
        {/* Section Title and Description */}
        <p className="text-xl">Labels</p>
        <p className="text-sm text-muted-foreground">Create, edit, or remove labels used across this project</p>
        <Separator className="mb-4" />

        <div className="flex justify-end ">
          <Button size="sm" onClick={onAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            New Label
          </Button>
        </div>
      </div>
    </>
  );
}
