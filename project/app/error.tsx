"use client";
import { DefaultHeader } from "@/components/default-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function Error() {
  return (
    <div className="min-h-[100vh]">
      <DefaultHeader />
      <div className=" min-h-[80vh] flex flex-col justify-center items-center gap-4 p-3">
        <div className="relative w-full h-[150px] md:h-[300px]">
          <Image src={"/error.svg"} fill alt="team" />
        </div>
        <div className="flex flex-col justify-center items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground text-center">
            Oops, We Ran Into An Error Chief.
          </h1>
          <p className="text-muted-foreground text-center text-sm md:text-base">
            Don&apos;t worry, this one&apos;s on us. In the meantime, try doing something else.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard">
            <Button variant="secondary">Return To Dashboard</Button>
          </Link>

          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      </div>
    </div>
  );
}
