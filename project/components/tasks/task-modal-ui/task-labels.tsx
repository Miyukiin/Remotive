"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Settings, Tag, Check } from "lucide-react";
import { useLabels } from "@/hooks/use-labels";
import { LabelSelect, TaskSelect } from "@/types";
import { getContrastYIQ } from "@/lib/utils";

type TaskLabelsProps = {
  activeTask: TaskSelect;
  project_id: number;
};

export function TaskLabels({ activeTask, project_id }: TaskLabelsProps) {
  const [open, setOpen] = useState(false);

  const {
    taskLabels = [],
    projectLabels = [],
    isTaskLabelsLoading,
    isProjectLabelsLoading,
    updateTaskLabels,
    isTaskLabelsUpdating,
  } = useLabels({ project_id, task_id: activeTask.id });

  const assignedLabelIds = useMemo(() => new Set(taskLabels.map((l) => l.id)), [taskLabels]);

  function handleSelect(label: LabelSelect) {
    const isSelected = assignedLabelIds.has(label.id);

    // Build the next list of labels for this task (toggle)
    const nextLabels: LabelSelect[] = isSelected ? taskLabels.filter((l) => l.id !== label.id) : [...taskLabels, label];

    updateTaskLabels({ task_id: activeTask.id, incomingLabels: nextLabels });
  }

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            className="flex items-center justify-between text-dark-grey-300 dark:text-white-smoke-200 hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/10 py-1 px-2 rounded-sm cursor-pointer"
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center gap-2 text-inherit">
              <Tag size={16} />
              <p className="text-sm font-medium">Labels</p>
            </div>
            <Settings size={16} />
          </div>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-48 p-3">
          <div className="text-xs text-muted-foreground mb-3">Select labels to assign</div>
          {/* Loading / empty states */}
          {isProjectLabelsLoading ? (
            <div className="p-2 text-sm text-muted-foreground">Loading labels…</div>
          ) : projectLabels.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">No labels in this project yet.</div>
          ) : (
            <ul role="menu" aria-label="Priority" className="space-y-1">
              {projectLabels.map((pl) => {
                const isSelected = assignedLabelIds.has(pl.id);
                return (
                  <li key={pl.id}>
                    <button
                      type="button"
                      onClick={() => {
                        handleSelect(pl);
                      }}
                      disabled={isTaskLabelsUpdating}
                      role="menuitemradio"
                      aria-checked={isSelected}
                      className={`w-full flex items-center justify-between rounded-sm px-2 py-1.5 text-sm
                                            hover:bg-black/10 dark:hover:bg-white/10
                                            ${isSelected ? "bg:black/10 dark:bg-white/10  font-medium" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full ring-1 ring-black/10"
                          style={{ backgroundColor: pl.color }}
                          aria-hidden="true"
                        />
                        <Badge
                          className="border"
                          style={{
                            backgroundColor: pl.color,
                            borderColor: "rgba(0,0,0,0.15)",
                            color: getContrastYIQ(pl.color).result,
                          }}
                        >
                          {pl.name.toUpperCase()}
                        </Badge>
                      </div>
                      {isSelected ? <Check size={14} /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex justify-end pt-2">
            <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Assigned Labels */}
      <div className="mt-1 flex flex-wrap gap-1 ml-8">
        {isTaskLabelsLoading ? (
          <p className="text-xs text-muted-foreground">Loading assigned labels…</p>
        ) : taskLabels.length ? (
          taskLabels.map((l) => (
            <Badge key={l.id} style={{ backgroundColor: l.color, color: getContrastYIQ(l.color).result }}>
              {l.name}
            </Badge>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">No labels</p>
        )}
      </div>
    </div>
  );
}
