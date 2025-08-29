"use client";

import type { ReactNode } from "react";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { Menu, Bell, Search, Loader2 } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import LoadingUI from "@/components/ui/loading-ui";
import { navigationItems } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useScreenWidth } from "@/lib/client-utils";

type Props = { children: ReactNode };

export default function DashboardLayout({ children }: Props) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const [count, setCount] = useState(3);
  const [navItems, setNavItems] = useState(navigationItems);

  const screenWidth = useScreenWidth();
  const isMobile = screenWidth ? (screenWidth < 768 ? true : false) : false;

  // Zustand for mobile sidebar
  const { isSideBarOpen, setSideBarOpen } = useUIStore();

  // Close mobileSidebar if we're on desktop and sideBarOpen
  useEffect(() => {
    if (!isMobile && isSideBarOpen) setSideBarOpen(false);
  }, [isMobile, isSideBarOpen, setSideBarOpen]);

  // Update active nav item based on current route
  useEffect(() => {
    if (isLoaded && isSignedIn && pathname) {
      setNavItems((prev) =>
        prev.map((item) => ({
          ...item,
          current: pathname.startsWith(item.href),
        })),
      );
    }
  }, [isLoaded, isSignedIn, pathname]);

  // Redirect unauthenticated with countdown
  useEffect(() => {
    if (isLoaded && isSignedIn === false) {
      const interval = setInterval(() => setCount((c) => c - 1), 1000);
      const timeout = setTimeout(() => router.push("/sign-in"), 3000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) return <LoadingUI />;

  if (isLoaded && isSignedIn === false) {
    return (
      <div className="flex h-[100vh] w-full flex-col items-center justify-center gap-2">
        <p className="text-2xl font-semibold">You must be signed in to view this page.</p>
        <p className="text-muted-foreground">Redirecting in {count}</p>
      </div>
    );
  }

  // Probably replace with the brand icon
  const Brand = (
    <Link href="/" className="text-xl font-bold tracking-tight">
      Remotive
    </Link>
  );

  // NavBarList
  const NavList = ({ onItemClick }: { onItemClick?: () => void }) => (
    <ul className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.name}>
            <Link
              href={item.href}
              onClick={() => {
                setNavItems((prev) => prev.map((it) => ({ ...it, current: it.name === item.name })));
                onItemClick?.();
              }}
              className={`
                flex items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-accent-foreground
                ${item.current ? "bg-primary text-accent-foreground" : "text-muted-foreground"},
              `}
            >
              <Icon className="mr-3 h-4 w-4" />
              <span className="truncate">{item.name}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-sidebar lg:block">
        <div className="flex h-16 items-center justify-between border-b px-6">{Brand}</div>
        <ScrollArea className="h-[calc(100vh-4rem)] px-3 py-4">
          <NavList />
        </ScrollArea>
      </div>

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Top Bar */}
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
          <div className="flex flex-1 items-center">
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
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Notifications">
                      <Bell className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Notifications</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <ThemeToggle />
            </div>

            <UserButton />
          </div>
        </div>

        {/* Page content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="flex h-[60vh] w-full items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-lg">Loading…</span>
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
