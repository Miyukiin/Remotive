import { teamSchema, userSchema } from "@/lib/validations/validations";
import { ColumnDef, FilterFn } from "@tanstack/react-table";
import z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../../ui/button";
import { ArrowDownZA, ArrowUpAZ } from "lucide-react";
import { rolesTuple } from "../../../lib/db/db-enums";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PendingProjectManager, ProjectRoles } from "@/types";

export type ProjectMember = {
  user: z.infer<typeof userSchema>;
  teams: z.infer<typeof teamSchema>[];
  roles: (typeof rolesTuple)[number];
};

const teamFilterFn: FilterFn<ProjectMember> = (row, _columnId, value) => {
  if (!value) return true; // show all when value is empty
  const val = String(value).toLowerCase();
  const teams = row.original.teams ?? [];
  return teams.some((t) => t.teamName.toLowerCase() === val);
};

export function getProjectDataTableMemberColumns(
  isLoading: boolean,
  setPendingProjectManager: (p: PendingProjectManager) => void,
  setReassignManagerModalOpen: (val: boolean) => void,
  onRoleChange: (userId: number, nextRole: ProjectRoles) => void,
): ColumnDef<ProjectMember>[] {
  return [
    {
      id: "user",
      accessorFn: (row) => `${row.user.name ?? ""} ${row.user.email ?? ""}`,
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          User
          {column.getIsSorted() === "asc" ? (
            <ArrowUpAZ className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDownZA className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Avatar>
            <AvatarImage src={row.original.user.image_url}></AvatarImage>
            <AvatarFallback>
              <div className="h-8 w-8 rounded-full bg-white-smoke-100 ring-2 ring-white-smoke-200 animate-pulse" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-foreground text-sm font-medium">{row.original.user.name}</p>
            <p className="text-foreground text-xs font-light">{row.original.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "teams",
      accessorFn: (row) => row.teams?.map((t) => t.teamName).join(" ") ?? "",
      filterFn: teamFilterFn, // Custom, check is user has this team
      header: () => "Teams",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.teams.map((team) => {
            return (
              <Badge key={`${team.id}-${row.id}`} variant="secondary" className="flex items-center p-1 px-2">
                {team.teamName}
              </Badge>
            );
          })}
        </div>
      ),
    },
    {
      accessorKey: "roles",
      header: () => "Roles",
      cell: ({ row }) => {
        const handleChange = (val: ProjectRoles) => {
          const userId = row.original.user.id;

          if (val === "Project Manager" && row.original.roles !== "Project Manager") {
            // set who we will update to be project manager, and open confirm modal
            setPendingProjectManager({ userId, role: val });
            setReassignManagerModalOpen(true);
          } else {
            // immediate update
            onRoleChange(userId, val);
          }
        };

        return (
          <Select defaultValue={row.original.roles} onValueChange={handleChange}>
            <SelectTrigger disabled={isLoading} className="w-[180px]">
              <SelectValue placeholder="Select A Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Roles</SelectLabel>
                {Object.values(rolesTuple).map((r, idx) => (
                  <SelectItem key={idx} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        );
      },
    },
  ];
}
