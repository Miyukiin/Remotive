"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      size="icon"
      className="active:bg-accent lg:p-5 "
    >
      <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90 duration-500" />
      <Moon className="absolute h-5 w-5  scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0 duration-500" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
