"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "./theme-provider";

export function BrandLogo() {
  const { theme } = useTheme();

  return (
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
}
