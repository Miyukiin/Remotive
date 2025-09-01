"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "../../ui/button";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "../../ui/input";
import { TeamsSelect } from "@/types";
import { Label } from "@radix-ui/react-label";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectMember } from "./columns-data-table-project-members";
import { useScreenWidth } from "@/lib/client-utils";

interface ProjectMembersDataTableProps {
  columns: ColumnDef<ProjectMember>[];
  data: ProjectMember[];
  teamOptions: TeamsSelect[];
  // buttonAction: (selectedUsers: UserSelect[]) => void;
  // buttonLoadingState: boolean;
}

export function ProjectMembersDataTable({ columns, data, teamOptions }: ProjectMembersDataTableProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const [teamFilter, setTeamFilter] = useState<string>("");

  // const executeButtonAction = (selectedRows: RowModel<UserSelect>) => {
  //   const users: UserSelect[] = selectedRows.rows.map((row) => row.original);
  //   buttonAction(users);
  //   setRowSelection({});
  // };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  return (
    <div className="b">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row items-center mb-4 gap-8">
        <Input
          placeholder="Search for a user..."
          value={(table.getColumn("user")?.getFilterValue() as string) ?? ""}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            table.getColumn("user")?.setFilterValue(event.target.value)
          }
          className="max-w-sm text-base"
        />
        <div className="flex flex-1 w-full items-center gap-2">
          <div className="flex w-full max-w-xs items-center">
            <Select
              value={teamFilter}
              onValueChange={(v) => {
                setTeamFilter(v);
                table.getColumn("teams")?.setFilterValue(v);
              }}
            >
              <SelectTrigger className="flex w-full max-w-xs text-base md:text-sm">
                <SelectValue placeholder="Select a Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Team</SelectLabel>

                  {teamOptions.map((t) => (
                    <SelectItem key={t.id} value={t.teamName}>
                      {t.teamName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {/* Clear Button */}
          <div className="flex">
            <Button
              variant="default"
              className="w-full"
              onClick={() => {
                setTeamFilter("");
                table.getColumn("teams")?.setFilterValue(undefined);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between mt-4 ml-2">
        <div className="flex items-center gap-4">
          <p className="text-xs text-dark-grey-50">{`${pageIndex + 1} | ${table.getPageCount()}`}</p>
          <div className="flex items-center space-x-2">
            {" "}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                table.previousPage();
                setPageIndex((prev) => prev - 1);
              }}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                table.nextPage();
                setPageIndex((prev) => prev + 1);
              }}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
