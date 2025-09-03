"use client";

import { useState } from "react";
import { Palette, ShieldUser } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@clerk/nextjs";
import { Appearance } from "@/components/settings/appearance";

type Section = "account" | "appearance";

export default function SettingsPage() {
  const [section, setSection] = useState<Section>("account");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account and application preferences</p>
      </div>

      {/* Nav */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <Card role="navigation" aria-label="Settings sections" className="flex w-full xl:max-w-[500px]">
          <CardHeader>
            <CardTitle className="text-base">Settings</CardTitle>
            <CardDescription>Choose a section</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button
              variant="ghost"
              className={`justify-start gap-3 ${section === "account" ? "bg-primary hover:bg-primary" : ""}`}
              onClick={() => setSection("account")}
              aria-current={section === "account" ? "page" : undefined}
            >
              <ShieldUser className="h-4 w-4" />
              Account Settings
            </Button>

            <Button
              variant="ghost"
              className={`justify-start gap-3 ${section === "appearance" ? "bg-primary hover:bg-primary" : ""}`}
              onClick={() => setSection("appearance")}
              aria-current={section === "appearance" ? "page" : undefined}
            >
              <Palette className="h-4 w-4" />
              Appearance
            </Button>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="w-full min-h-0">
          {section === "account" ? (
            <UserProfile
              routing="hash"
              appearance={{
                elements: {
                  // outer wrapper
                  rootBox: "w-full",

                  // card container
                  card: "w-full md:max-w-none",
                  cardBox: "w-full md:max-w-none h-full",

                  //  make inner scroll area also stretch
                  scrollBox: "w-full md:max-w-none",
                },
              }}
            />
          ) : (
            <Card className="flex-1 w-full h-full max-h-[704px]">
              {/* just copy userprofile component dimensions across diff views */}
              <CardHeader className="flex flex-row items-center gap-3">
                <Palette className="h-5 w-5" />
                <div>
                  <CardTitle className="text-base">Appearance</CardTitle>
                  <CardDescription>Theme & display preferences</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <Appearance />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
