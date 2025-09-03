"use client";

import Image from "next/image";
import { useTheme } from "./theme-provider";

export function WebsitePreview() {
  const { theme } = useTheme();

  return (
    <div className="relative w-full h-full overflow-hidden rounded-md border border-border ring-2 ring-green-900">
      <Image
        src={theme === "light" ? "/light-mode-website-picture.png" : "/dark-mode-website-picture.png"}
        alt="website-image"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}
