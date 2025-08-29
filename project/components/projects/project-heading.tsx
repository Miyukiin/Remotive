import { ProjectSelect } from "@/types";
import { ArrowLeft, Calendar, LucideIcon, PanelsTopLeft, Settings, Users } from "lucide-react";
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
import { Badge } from "../ui/badge";
import { projectStatusColor } from "@/lib/utils";

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  current: boolean;
  description: string;
};

type ProjectHeadingProps = {
  project: ProjectSelect;
};

const ProjectHeading: FC<ProjectHeadingProps> = ({ project }) => {
  const baseNavItems: NavItem[] = [
    {
      name: "Default",
      href: `${project.id}`,
      icon: PanelsTopLeft,
      current: false,
      description: "Kanban board view for managing tasks",
    },
    {
      name: "Members",
      href: "members",
      icon: Users,
      current: false,
      description: "Manage your project's members",
    },
    {
      name: "Calendar",
      href: "calendar",
      icon: Calendar,
      current: false,
      description: "View your project's tasks calendar-style",
    },
    {
      name: "Settings",
      href: "settings",
      icon: Settings,
      current: false,
      description: "Manage your project settings and preferences",
    },
  ];

  const pathname = usePathname();

  const normalized = pathname.replace(/\/$/, ""); // trim trailing slash

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
    <div className="flex flex-col gap-y-8">
      {/* Breadcrumbs */}
      <div className="flex gap-2 items-center">
        <Link href="/projects" className="p-2 hover:bg-foreground/10 rounded-lg transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {isDefault ? (
              <BreadcrumbItem>
                <BreadcrumbPage>{project.name}</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/projects/${project.id}`}>{project.name}</BreadcrumbLink>
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
      {/* Project Name, View Description, Buttons */}
      <div className="flex flex-col gap-4 justify-start md:flex-row md:justify-between md:gap-0">
        <div>
          <div className="flex gap-3 items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{project.name}</h1>
            <div>
              <Badge className={projectStatusColor[project.status]}>{project.status}</Badge>
            </div>
          </div>

          <p className="text-sm md:text-base text-foreground/70 mt-1">
            {navItems.find((n) => n.current)?.description ?? "Loading..."}
          </p>
        </div>

        <div className="flex justify-center">
          <div className="bg-foreground/5 rounded-md md:bg-transparent flex grow-0 justify-center items-center space-x-2">
            {navItems.map((itm, idx) => {
              return (
                <Link
                  key={idx}
                  href={itm.name === "Default" ? `/projects/${project.id}` : `/projects/${project.id}/${itm.href}`}
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
      </div>
    </div>
  );
};

export default ProjectHeading;
