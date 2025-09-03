import Link from "next/link";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "./brand-logo";

export function Footer() {
  return (
    <footer className="bg-primary/10 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-2xl font-bold tracking-tight">Remotive</h3>
            <p className="mt-2 text-muted-foreground">
              The modern project management platform that helps you deliver.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="font-semibold">Company</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="font-semibold">Support</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="font-semibold">Follow us</h4>
            <div className="mt-4 flex items-center gap-2">
              <Button asChild size="icon" variant="ghost" aria-label="Facebook">
                <Link href="#" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="icon" variant="ghost" aria-label="LinkedIn">
                <Link href="#" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="icon" variant="ghost" aria-label="Instagram">
                <Link href="#" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <BrandLogo />

          <p className="text-sm text-muted-foreground">© 2025 Remotive. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
