import Link from "next/link";
import { ArrowRight, CheckCircle, Users, Kanban, CircleCheckBig, MoveUpRight } from "lucide-react";
import { DefaultHeader } from "@/components/default-header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { WebsitePreview } from "@/components/website-preview";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DefaultHeader />

      <div>
        {/* Banner*/}
        <div className="relative overflow-hidden px-4 sm:px-6 lg:px-8 bg-[linear-gradient(7deg,rgba(200,255,220,1)_0%,rgba(255,255,255,1)_100%)] dark:bg-[linear-gradient(180deg,rgba(18,_21,_18,_1)_0%,_rgba(41,_61,_55,_1)_100%)]">
          <div className="">
            <div className="flex flex-col justify-center items-center py-16 md:py-32 min-h-[calc(100vh-64px)]">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground text-center">
                Manage Projects with <span className="text-emerald-600 dark:text-primary">Remotive</span>
              </h1>

              <p className="mt-4 md:mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl font-medium mx-auto text-center">
                Stay on top of tasks, collaborate seamlessly across teams, and track progress effortlessly with our
                intuitive drag-and-drop platform.
              </p>

              <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild size="lg" className="w-full md:w-fit">
                  <Link href="/dashboard">
                    Start Delivering Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                <Button asChild size="lg" variant="outline" className="w-full md:w-fit">
                  <Link href="/projects">View Projects</Link>
                </Button>
              </div>

              {/* Feature highlights */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Kanban className="h-5 w-5 text-primary" />
                  <span>Drag &amp; Drop Boards</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Team Collaboration</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Task Management</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Showcase*/}
        <div className="flex flex-col justify center items-center px-4 gap-12 py-16 md:py-32 min-h-[calc(100vh-64px)] bg-[linear-gradient(7deg,rgba(255,255,255,1)_0%,rgba(200,255,220,1)_100%)] dark:bg-[linear-gradient(180deg,rgba(41,_61,_55,_1)_0%,_rgba(18,_21,_18,_1)_100%)]">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground text-center">
            All In a <span className="text-emerald-600 dark:text-primary">Single Source</span> Of Truth
          </h1>
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <Badge className="flex gap-1 items-center w-full md:w-fit">
              <CircleCheckBig className="" />
              <span className="text-sm md:text-base text-foreground">Plan projects & sprints</span>
            </Badge>

            <Badge className="flex gap-1 items-center w-full md:w-fit">
              <CircleCheckBig className="" />
              <span className="text-sm md:text-base text-foreground">Track progress in real time</span>
            </Badge>

            <Badge className="flex gap-1 items-center w-full md:w-fit">
              <CircleCheckBig className="" />
              <span className="text-sm md:text-base text-foreground">Collaborate across teams</span>
            </Badge>

            <Badge className="flex gap-1 items-center w-full md:w-fit">
              <CircleCheckBig className="" />
              <span className="text-sm md:text-base text-foreground">Analyze workloads & velocity</span>
            </Badge>
          </div>
          <div className="flex w-full justify-center">
            <div className="w-full max-w-[900px] aspect-[16/7.5]">
              <WebsitePreview />
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col justify-center items-center px-4 gap-12 py-16 md:py-32 min-h-[calc(100vh-64px)]">
          <div className="relative aspect-square w-full md:max-w-[30%] lg:max-w-[20%] md:h-[40%]">
            <Image src={"/team.svg"} fill alt="team" objectFit="cover" />
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground text-center">
              Ready to elevate your <span className="text-emerald-600 dark:text-primary">team?</span>
            </h1>

            <p className="tracking-tight text-muted-foreground text-center">
              {" "}
              Increase efficiency, productivity and business performance with Remotive&apos;s project management
              capabilities.
            </p>
          </div>
          <div className="mt-3 md:mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button className="bg-primary px-4 py-4 rounded-full md:w-fit hover:scale-110 transition-all duration-300 font-medium">
              <Link href="/dashboard" className="inline-flex">
                Start Managing <MoveUpRight className="ml-2 h-5 w-5" />
              </Link>
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
