import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-[100vh]">
      <div className=" min-h-[80vh] flex flex-col justify-center items-center gap-4 p-3">
        <div className="relative w-full h-[150px] md:h-[300px]">
          <Image src={"/loading.svg"} fill alt="team" />
        </div>
        <div className="flex flex-col justify-center items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground text-center">Loading...</h1>
          <p className="text-muted-foreground text-center text-sm md:text-base">Taking it one step at a time.</p>
        </div>
      </div>
    </div>
  );
}
