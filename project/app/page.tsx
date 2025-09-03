import Link from "next/link";
import { ArrowRight, CheckCircle, Users, Kanban } from "lucide-react";
import { DefaultHeader } from "@/components/default-header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  const roadmap = [
    { phase: "1.0", title: "Project Setup", status: "pending", tasks: 6 },
    { phase: "2.0", title: "Authentication", status: "pending", tasks: 6 },
    { phase: "3.0", title: "Database Setup", status: "pending", tasks: 6 },
    { phase: "4.0", title: "Core Features", status: "pending", tasks: 6 },
    { phase: "5.0", title: "Kanban Board", status: "pending", tasks: 6 },
    { phase: "6.0", title: "Advanced Features", status: "pending", tasks: 6 },
    { phase: "7.0", title: "Testing", status: "pending", tasks: 6 },
    { phase: "8.0", title: "Deployment", status: "pending", tasks: 6 },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DefaultHeader />

      <div className="px-4 sm:px-6 lg:px-8">
        {" "}
        {/* Aligned with Default header */}
        {/* Hero */}
        <div className="">
          <div className="flex flex-col items-center py-16 md:py-24">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Manage Projects with <span className="text-primary">Kanban Boards</span>
            </h1>

            <p className="mt-4 md:mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Organize tasks, collaborate with teams, and track progress with our intuitive drag-and-drop platform.
            </p>

            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="w-full md:w-fit">
                <Link href="/dashboard">
                  Start Managing Projects
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
        <Separator className="my-8" />
        {/* Roadmap */}
        <div className="">
          <div className="py-12">
            <h2 className="text-3xl font-bold text-center tracking-tight text-foreground">Implementation Roadmap</h2>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roadmap.map((item) => (
                <Card key={item.phase}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Phase {item.phase}</Badge>
                      <div className="flex items-center gap-2">
                        <span className="sr-only">Status</span>
                        <span className="h-2 w-2 rounded-full bg-yellow-500" />
                        <span className="text-sm text-muted-foreground capitalize">{item.status}</span>
                      </div>
                    </div>
                    <CardTitle className="mt-3">{item.title}</CardTitle>
                    <CardDescription>{item.tasks} tasks</CardDescription>
                  </CardHeader>
                  <CardContent />
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
