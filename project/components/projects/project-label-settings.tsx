"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Plus, Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useUIStore } from "@/stores/ui-store";
import { LabelCreateModal } from "../modals/label-create-modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

import { useLabels } from "@/hooks/use-labels";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { LabelDeleteModal } from "../modals/label-delete-modal";
import { useLabelStore } from "@/stores/labels-store";
import { LabelSelect } from "@/types";

type Props = { project_id: number };

export function ProjectLabelSettings({ project_id }: Props) {
  const { setCreateLabelModalOpen, setDeleteLabelModalOpen } = useUIStore();
  const { setLabelToDelete } = useLabelStore();
  const { projectLabels, isProjectLabelsLoading } = useLabels(project_id);
  const labels = (projectLabels as LabelSelect[]) ?? [];

  function onAddClick() {
    setCreateLabelModalOpen(true);
  }

  function onDeleteClick(e: React.MouseEvent, row: LabelSelect) {
    setLabelToDelete(row);
    setDeleteLabelModalOpen(true);
  }

  return (
    <>
      <LabelDeleteModal project_id={project_id} /> <LabelCreateModal project_id={project_id} />
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

        <div className="mt-3 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[240px]">Name</TableHead>
                <TableHead className="w-[220px]">Color</TableHead>
                <TableHead className="w-[120px]">Default</TableHead>
                <TableHead className="text-right w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isProjectLabelsLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : labels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No labels yet
                  </TableCell>
                </TableRow>
              ) : (
                labels.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full ring-1 ring-black/10"
                          style={{ backgroundColor: row.color }}
                          aria-hidden="true"
                        />

                        <p>{row.color.toUpperCase()}</p>
                      </div>
                    </TableCell>

                    <TableCell>{row.isDefault ? <Badge variant="secondary">Default</Badge> : "No"}</TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {}}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={(e) => onDeleteClick(e, row)}
                            disabled={row.isDefault}
                          >
                            <Trash className="mr-2 h-4 w-4 " />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
