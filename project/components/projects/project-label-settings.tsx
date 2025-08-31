"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CircleQuestionMark, MoreHorizontal, Pencil, Plus, Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";

import { useUIStore } from "@/stores/ui-store";
import { useLabelStore } from "@/stores/labels-store";
import { useLabels } from "@/hooks/use-labels";

import { CreateLabelModal } from "../modals/create-label-modal";
import { DeleteLabelModal } from "../modals/delete-label-modal";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

import type { LabelSelect } from "@/types";
import { UpdateLabelModal } from "../modals/update-label-modal";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { getContrastYIQ } from "@/lib/utils";

type Props = { project_id: number };

export function ProjectLabelSettings({ project_id }: Props) {
  const { setCreateLabelModalOpen, setDeleteLabelModalOpen, setUpdateLabelModalOpen } = useUIStore();
  const { setLabelToDelete, setLabelToUpdate } = useLabelStore();
  const { projectLabels, isProjectLabelsLoading } = useLabels({ project_id });

  const labels = (projectLabels as LabelSelect[]) ?? [];

  function onAddClick() {
    setCreateLabelModalOpen(true);
  }

  function onDeleteClick(row: LabelSelect) {
    setLabelToDelete(row);
    setDeleteLabelModalOpen(true);
  }

  function onEditClick(row: LabelSelect) {
    setLabelToUpdate(row);
    setUpdateLabelModalOpen(true);
  }

  // Columns for tanstack Data Table
  const columns = useMemo<ColumnDef<LabelSelect>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Label Name",
        cell: ({ row }) => <span className="font-medium">{row.getValue<string>("name")}</span>,
      },
      {
        accessorKey: "color",
        header: "Label Color",
        cell: ({ row }) => {
          const color = row.getValue<string>("color") ?? "#808080";
          return (
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <Badge
                className="border text-foreground"
                style={{
                  backgroundColor: color,
                  borderColor: "rgba(0,0,0,0.15)",
                  color: getContrastYIQ(color).result
                }}
              >
                {color.toUpperCase()}
              </Badge>
            </div>
          );
        },
        // Allow global filter to match this column
        filterFn: "includesString",
      },
      {
        accessorKey: "isDefault",
        header: "Default",
        cell: ({ row }) => (row.getValue<boolean>("isDefault") ? <Badge variant="secondary">Default</Badge> : "No"),
        enableGlobalFilter: false,
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex gap-2 items-center">
                      <span>Actions </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CircleQuestionMark size={14} />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Default labels cannot be edited or deleted.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      onEditClick(item);
                    }}
                    disabled={item.isDefault}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => onDeleteClick(item)} disabled={item.isDefault}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        enableGlobalFilter: false,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  ); // columns stable

  // Table Config (pagination + filtering)
  const [globalFilter, setGlobalFilter] = useState("");
  const table = useReactTable({
    data: labels,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // enables search
    getPaginationRowModel: getPaginationRowModel(), // enables pagination
  });

  return (
    <>
      <DeleteLabelModal project_id={project_id} />
      <CreateLabelModal project_id={project_id} />
      <UpdateLabelModal project_id={project_id} />

      <div className="flex flex-col gap-2">
        {/* Section Title and Description */}
        <p className="text-xl">Labels</p>
        <p className="text-sm text-muted-foreground">Create, edit, or remove labels used across this project</p>
        <Separator className="mb-4" />

        {/* Top bar: Search + New */}
        <div className="flex items-center justify-between gap-2">
          <Input
            placeholder="Search labels by name or color…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-xs"
          />
          <Button size="sm" onClick={onAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            New Label
          </Button>
        </div>

        <div className="mt-3 rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id} className={header.id === "actions" ? "text-right w-[80px]" : ""}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {isProjectLabelsLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={cell.column.id === "actions" ? "text-right" : ""}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    No results
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-end gap-2 py-2">
          <span className="text-sm text-muted-foreground mr-2">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
