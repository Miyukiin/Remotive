"use client";

import type { ReactNode } from "react";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import LoadingUI from "@/components/ui/loading-ui";
import { navigationItems } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useScreenWidth } from "@/lib/client-utils";
import Image from "next/image";
import { useTheme } from "@/components/theme-provider";
import { DashboardHeader } from "@/components/dashboard-header";
import { Loader2 } from "lucide-react";

type Props = { children: ReactNode };

export default function DashboardLayout({ children }: Props) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();

  const [count, setCount] = useState(3);
  const [navItems, setNavItems] = useState(navigationItems);

  const screenWidth = useScreenWidth();
  const isMobile = screenWidth ? (screenWidth <= 768 ? true : false) : false;

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

  // Logo
  const Brand = (
    <Link href="/" aria-label="Remotive Home" className="group relative inline-flex h-8 w-[150px] items-center">
      {theme === "light" ? (
        <Image
          src={`/light-logo.png`}
          fill
          sizes="150px"
          alt="remotive-logo"
          priority
          className="transition-all object-contain duration-300 group-hover:drop-shadow-[0_0_6px_rgba(16,185,129,0.9)]"
        />
      ) : (
        <Image
          src={`/dark-logo.png`}
          fill
          sizes="150px"
          alt="remotive-logo"
          priority
          className="transition-all object-contain duration-300 group-hover:drop-shadow-[0_0_6px_rgba(16,185,129,0.9)]"
        />
      )}
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
                flex items-center rounded-md px-3 py-2 text-sm hover:text-accent-foreground
                ${item.current ? "bg-primary text-accent-foreground" : "text-muted-foreground transition-colors hover:bg-sidebar-accent  "},
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
        <DashboardHeader
          isSideBarOpen={isSideBarOpen}
          setSideBarOpen={setSideBarOpen}
          Brand={Brand}
          NavList={NavList}
        />

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
