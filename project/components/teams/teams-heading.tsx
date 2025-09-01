import { TeamsSelect } from "@/types";
import { ArrowLeft, LucideIcon, Settings, Users2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC, useMemo } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import LeaveTeamButton from "./teams-slug/leave-team-button";
import { useTeams } from "@/hooks/use-teams";
import AddMembersButton from "./teams-slug/add-members-button";
import { useUIStore } from "@/stores/ui-store";
import AddTeamMembersModal from "../modals/add-team-members-modal";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  current: boolean;
  description: string;
};

type TeamsHeadingProps = {
  team: TeamsSelect;
};

const TeamsHeading: FC<TeamsHeadingProps> = ({ team }) => {
  const { isTeamLeader } = useTeams({team_id: team.id});
  const { setAddMemberModalOpen } = useUIStore();

  const baseNavItems: NavItem[] = [
    {
      name: "Default",
      href: `${team.id}`,
      icon: Users2,
      current: false,
      description: "View your team",
    },
    {
      name: "Settings",
      href: "settings",
      icon: Settings,
      current: false,
      description: "Manage your team settings and preferences",
    },
  ];

  const pathname = usePathname();

  const normalized = pathname.replace(/\/$/, "");

  const navItems = useMemo(
    () =>
      baseNavItems.map((item) => ({
        ...item,
        current: normalized.endsWith(String(item.href)),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [normalized],
  );

  const isDefault = navItems.some((n) => n.current && n.name === "Default");
  return (
    <>
      <AddTeamMembersModal team_id={team.id} />

      <div className="flex flex-col gap-y-8">
        {/* Breadcrumbs */}
        <div className="flex gap-2 items-center">
          <Link href="/teams" className="p-2 hover:bg-accent rounded-lg transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/teams">Teams</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {isDefault ? (
                <BreadcrumbItem>
                  <BreadcrumbPage>{team.teamName}</BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/teams/${team.id}`}>{team.teamName}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {navItems.find((n) => n.current && n.name !== "Default")?.name ?? "Loading..."}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {/* Team Name, View Description, Buttons */}
        <div className="flex flex-col gap-4 justify-start md:flex-row md:justify-between md:gap-0">
          <div>
            <div className="flex gap-3 items-center">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{team.teamName}</h1>
            </div>

            <p className="text-sm md:text-base text-foreground/70 mt-1">
              {navItems.find((n) => n.current)?.description ?? "Loading..."}
            </p>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-col md:flex-row justify-center gap-6">
              <div className="flex justify-center">
                <div className="bg-foreground/5 rounded-md md:bg-transparent flex grow-0 justify-center items-center space-x-2">
                  {navItems.map((itm, idx) => {
                    return !isTeamLeader && itm.name === "Settings" ? (
                      ""
                    ) : (
                      <Link
                        key={idx}
                        href={itm.name === "Default" ? `/teams/${team.id}` : `/teams/${team.id}/${itm.href}`}
                      >
                        <button
                          className={`p-2 rounded-lg transition-colors ${
                            itm.current
                              ? "bg-emerald-600 dark:bg-emerald-800 text-white "
                              : "text-foreground/70 hover:bg-accent hover:text-foreground"
                          }`}
                        >
                          <itm.icon size={20} />
                        </button>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col mt-4 md:flex-row md:mt-0 gap-2">
                <LeaveTeamButton team_id={team.id} />
                {isTeamLeader && <AddMembersButton onClick={() => setAddMemberModalOpen(true)} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamsHeading;
