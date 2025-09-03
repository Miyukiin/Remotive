import { DefaultHeader } from "@/components/default-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-[100vh]">
      <DefaultHeader />
      <div className=" min-h-[80vh] flex flex-col justify-center items-center gap-4 p-3">
        <div className="relative w-full h-[150px] md:h-[300px]">
          <Image src={"/404.svg"} fill alt="team" />
        </div>
        <div className="flex flex-col justify-center items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground text-center">
            Argh, We Couldn&apos;t Find That.
          </h1>
          <p className="text-muted-foreground text-center text-sm md:text-base">
            I don&apos;t think we have it. Sorry!
          </p>
        </div>
        <Link href="/">
          <Button>Return To Home</Button>
        </Link>
      </div>
    </div>
  );
}
