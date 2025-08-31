"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { priorityTuple } from "@/lib/db/db-enums";
import { capitalize, taskPriorityColor } from "@/lib/utils";
import { TaskSelect } from "@/types";
import { Flame, Settings, Check } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";

type TaskPriorityProps = {
  activeTask: TaskSelect;
  project_id: number;
};
type Priority = (typeof priorityTuple)[number];

export function TaskPriority({ activeTask, project_id }: TaskPriorityProps) {
  const [open, setOpen] = useState(false);
  const { updateTaskNew, isUpdateTaskNewLoading } = useTasks({ task_id: activeTask.id });

  async function handleSelect(p: Priority) {
    if (p === activeTask.priority) {
      setOpen(false);
      return;
    }
    await updateTaskNew({
      task_id: activeTask.id,
      project_id,
      taskFormData: { priority: p },
    });
    setOpen(false);
  }

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={isUpdateTaskNewLoading}
            className="flex w-full items-center justify-between text-dark-grey-300 dark:text-white-smoke-200
                       hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/10
                       py-1 px-2 rounded-sm"
          >
            <div className="flex items-center gap-2">
              <Flame size={16} />
              <span className="text-sm font-medium">Priority</span>
            </div>
            <Settings size={16} />
          </button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-48 p-1">
          <ul role="menu" aria-label="Priority" className="space-y-1">
            {priorityTuple.map((p) => {
              const selected = p === activeTask.priority;
              return (
                <li key={p}>
                  <button
                    type="button"
                    onClick={() => handleSelect(p as Priority)}
                    disabled={isUpdateTaskNewLoading}
                    role="menuitemradio"
                    aria-checked={selected}
                    className={`w-full flex items-center justify-between rounded-sm px-2 py-1.5 text-sm
                                hover:bg-black/10 dark:hover:bg-white/10
                                ${selected ? "bg:black/10 dark:bg-white/10  font-medium" : ""}`}
                  >
                    <span className="flex items-center gap-2">
                      <Badge className={taskPriorityColor[p as Priority]}>{capitalize(p as Priority)}</Badge>
                    </span>
                    {selected ? <Check size={14} /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>

      <div className="mt-1 flex gap-1 ml-8">
        <Badge className={taskPriorityColor[activeTask.priority]}>{capitalize(activeTask.priority)}</Badge>
      </div>
    </div>
  );
}
