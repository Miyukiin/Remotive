import { UserButton } from "@clerk/nextjs";
import { Menu, Search, Bell } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Input } from "./ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import type { FC, JSX } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

type DashboardHeaderProps = {
  isSideBarOpen: boolean;
  setSideBarOpen: (val: boolean) => void;
  Brand: JSX.Element;
  NavList: FC<{ onItemClick?: () => void }>;
};

export function DashboardHeader({ isSideBarOpen, setSideBarOpen, Brand, NavList }: DashboardHeaderProps) {
  return (
    <div className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-sidebar px-4 sm:gap-4 sm:px-6 lg:px-8">
      <div className="lg:hidden">
        {/* Mobile Sidebar (Sheet) */}
        <Sheet open={isSideBarOpen} onOpenChange={setSideBarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b px-6 py-4">
              <SheetTitle className="text-left">{Brand}</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-4rem)] px-3 py-4">
              <NavList onItemClick={() => setSideBarOpen(false)} />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* Search */}
      <div className="flex flex-1 items-center opacity-0 pointer-events-none">
        <div className="relative w-full max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input placeholder="Search projects, tasks…" className="pl-9" aria-label="Search" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {/* <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
          </TooltipProvider> */}

          <ThemeToggle />
        </div>

        <UserButton />
      </div>
    </div>
  );
}
