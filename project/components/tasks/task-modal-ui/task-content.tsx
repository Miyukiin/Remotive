import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { useState } from "react";
import { TaskSelect } from "@/types";

type TaskContentProps = {
  activeTask: TaskSelect;
  isMobile: boolean;
};

const DynamicRichTextEditor = dynamic(() => import("../../ui/rich-text-editor"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

export function TaskContent({ activeTask, isMobile }: TaskContentProps) {
  const [isEditingContent, setIsEditingContent] = useState(false);
  return (
    <div className="flex w-full gap-3">
      {" "}
      {!isMobile && (
        <Avatar className="w-12 h-12">
          <AvatarImage src="https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zMHVGZXExRll1cENQdEY5amg1YkhMdUU2TDEifQ" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      )}
      <div className="w-full rounded-md border border-green/400 dark:border-green-200/10">
        <div className="flex justify-between items-center gap-2 px-3 py-2 border-b border-green/400 dark:border-green-200/10">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Avatar className="w-6 h-6">
                <AvatarImage src="https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zMHVGZXExRll1cENQdEY5amg1YkhMdUU2TDEifQ" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            )}
            <p className="text-sm">
              <span className="font-medium">jrconcha-strat</span> opened 4 days ago ·{" "}
              <span className="font-medium">jrconcha-strat</span>{" "}
            </p>
          </div>
          {/* Dropdown for Editing. Should replace text content with a rich text editor. */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setIsEditingContent(true)}>Edit</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Text Content. This would be Render React Markdown styled with Prose */}
        <div className="p-3 w-full">
          {isEditingContent ? (
            <DynamicRichTextEditor />
          ) : (
            <p className="justify-evenly text-sm">{activeTask.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
