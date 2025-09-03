"use client";

import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useTheme } from "@/components/theme-provider";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { useScreenWidth } from "@/lib/client-utils";
import { LayoutDashboard, MenuIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

function Brand() {
  const { theme } = useTheme();
  return (
    <Link href="/" aria-label="Remotive Home" className="group relative inline-flex h-8 w-[150px] items-center">
      {theme === "light" ? (
        <Image
          src="/light-logo.png"
          alt="remotive-logo"
          fill
          sizes="150px"
          priority
          className="object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_6px_rgba(16,185,129,0.9)]"
        />
      ) : (
        <Image
          src="/dark-logo.png"
          alt="remotive-logo"
          fill
          sizes="150px"
          priority
          className="object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_6px_rgba(16,185,129,0.9)]"
        />
      )}
    </Link>
  );
}

export function DefaultHeader() {
  const width = useScreenWidth();
  const isMobile = width ? width < 768 : false;
  return (
    <header className="sticky top-0 z-30 border-b bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/75">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-3">
          <Brand />

          <div className="flex gap-6 items-center">
            <SignedIn>
              {!isMobile && (
                <Link href="/dashboard">
                  <Button size="sm" variant="default">
                    Return to Dashboard
                  </Button>
                </Link>
              )}

              <div className="flex gap-2 items-center">
                {isMobile && (
                  <Button size="sm" variant="default">
                    <LayoutDashboard />
                  </Button>
                )}
                <UserButton />
                <ThemeToggle />
              </div>
            </SignedIn>

            <SignedOut>
              {!isMobile ? (
                <div className="flex gap-4 items-center">
                  <div className="flex gap-6 items-center">
                    <Link href="/sign-in" className="text-sm text-muted-foreground hover:underline">
                      Sign In
                    </Link>
                    <Link href="/sign-up">
                      <Button size="default" className="rounded-full">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                  <ThemeToggle />
                </div>
              ) : (
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Open menu">
                        <MenuIcon className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <Link href="/sign-in">
                        <DropdownMenuItem asChild>
                          <span className="cursor-pointer">Sign In</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/sign-up">
                        <DropdownMenuItem asChild>
                          <span className="cursor-pointer">Get Started</span>
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <ThemeToggle />
                </div>
              )}
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}
