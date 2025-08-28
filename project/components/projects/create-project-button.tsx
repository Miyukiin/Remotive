"use client";
import { useUIStore } from "@/stores/ui-store";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";

export function CreateProjectButton() {
  const { setCreateProjectModalOpen } = useUIStore();

  return (
    <Button className="font-medium" onClick={() => setCreateProjectModalOpen(true)}>
      <Plus size={20} className="mr-2" />
      New Project
    </Button>
  );
}
