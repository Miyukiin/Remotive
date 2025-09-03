import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

type Testimonial = {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string; // replace with your image paths
  initials: string;
  quote: string;
  rating: 1 | 2 | 3 | 4 | 5;
  tag?: string;
};

const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Alex Rivera",
    role: "Project Manager",
    company: "Northwind Labs",
    avatar: "/avatars/alex.png",
    initials: "AR",
    quote:
      "Remotive turned our messy backlog into a clean, drag-and-drop flow. Standups are faster and blockers are obvious.",
    rating: 5,
    tag: "Kanban Convert",
  },
  {
    id: "t2",
    name: "Mina Santos",
    role: "Engineering Lead",
    company: "ByteForge",
    avatar: "/avatars/mina.png",
    initials: "MS",
    quote:
      "The optimistic updates make task moves feel instant. Our team velocity went up without changing our process.",
    rating: 5,
    tag: "Faster Sprints",
  },
  {
    id: "t3",
    name: "Daniel Cho",
    role: "QA Automation",
    company: "ShipRight",
    avatar: "/avatars/daniel.png",
    initials: "DC",
    quote: "Labels and filters are spot-on. I can slice test runs by feature and hand off issues with full context.",
    rating: 4,
  },
  {
    id: "t4",
    name: "Rhea Villanueva",
    role: "Product Designer",
    company: "Studio Eight",
    avatar: "/avatars/rhea.png",
    initials: "RV",
    quote: "Comments and activity history keep our design reviews tidy. No more lost threads across apps.",
    rating: 5,
  },
  {
    id: "t5",
    name: "Owen Hart",
    role: "CTO",
    company: "BlueStack",
    avatar: "/avatars/owen.png",
    initials: "OH",
    quote: "RBAC just works. Managers see what they need, contributors stay focused—security without friction.",
    rating: 5,
    tag: "Secure & Focused",
  },
  {
    id: "t6",
    name: "Janelle Cruz",
    role: "Scrum Master",
    company: "Pioneer Apps",
    avatar: "/avatars/janelle.png",
    initials: "JC",
    quote: "Setup took minutes. The dashboard gives me a clear pulse on sprint health at a glance.",
    rating: 4,
  },
  {
    id: "t7",
    name: "Leo Park",
    role: "Full-stack Dev",
    company: "Monarch",
    avatar: "/avatars/leo.png",
    initials: "LP",
    quote: "Moving tasks between lists feels buttery. The UX hits that sweet spot between power and simplicity.",
    rating: 5,
  },
  {
    id: "t8",
    name: "Sofia Reyes",
    role: "Ops Coordinator",
    company: "FieldFlow",
    avatar: "/avatars/sofia.png",
    initials: "SR",
    quote: "Finally, one place for projects, labels, and activity. Handovers are smoother and onboarding is easier.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <div className="">
      <div className="py-12">
        <h2 id="testimonials-heading" className="text-3xl font-bold text-center tracking-tight text-foreground">
          What Our Customers Are Saying
        </h2>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t) => (
            <Card key={t.id} className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={t.avatar} alt={`${t.name} avatar`} />
                      <AvatarFallback>{t.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base leading-tight">{t.name}</CardTitle>
                      <CardDescription className="leading-tight">
                        {t.role} · <span className="font-medium text-foreground/80">{t.company}</span>
                      </CardDescription>
                    </div>
                  </div>
                  {t.tag ? <Badge variant="secondary">{t.tag}</Badge> : null}
                </div>

                {/* Stars */}
                <div className="mt-3 flex items-center gap-1" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < t.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/40"
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                  <span className="sr-only">{t.rating} / 5</span>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">“{t.quote}”</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
