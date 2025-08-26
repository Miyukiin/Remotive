"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTasks } from "@/hooks/use-tasks";
import { useLists } from "@/hooks/use-lists";
import { listColor } from "@/lib/utils";
import { TaskSelect } from "@/types";
import { Check, Loader, Settings } from "lucide-react";

type TaskStatusProps = {
  activeTask: TaskSelect;
  project_id: number;
};

export function TaskStatus({ activeTask, project_id }: TaskStatusProps) {
  const { lists } = useLists(project_id);
  const { updateTaskNew, isUpdateTaskNewLoading } = useTasks({
    task_id: activeTask.id,
  });

  const [open, setOpen] = useState(false);

  // Retrieve the list of tasks of target list.
  const [targetListId, setTargetListId] = useState<number | null>(activeTask.listId ?? null);
  const { listTasks: targetListTasks } = useTasks(
    targetListId ? { list_id: targetListId } : { list_id: activeTask.listId },
  );

  // Calculate position of task in new list based on tasks amount of target list.
  const position = typeof targetListTasks?.length === "number" ? targetListTasks.length : 0;

  // Display currently selected statusLabel and color
  const statusLabel = lists?.find((l) => l.id === activeTask.listId)?.name ?? "No status";
  const colorKey = lists?.find((l) => l.id === activeTask.listId)?.color ?? "GRAY";

  async function handleSelect(nextListId: number) {
    if (activeTask.listId === nextListId) {
      setOpen(false);
      return;
    }

    // Ensure we compute position for the *clicked* list.
    // If the user didn't hover first, we still set targetListId so the hook fetches correctly on next render.
    if (targetListId !== nextListId) {
      setTargetListId(nextListId);
    }

    await updateTaskNew({
      task_id: activeTask.id,
      project_id,
      taskFormData: { listId: nextListId, position },
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
              <Loader size={16} />
              <span className="text-sm font-medium">Status</span>
            </div>
            <Settings size={16} />
          </button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-56 p-1">
          <ul role="menu" aria-label="Status" className="space-y-1">
            {(lists ?? []).map((ls) => {
              const selected = activeTask.listId === ls.id;
              const badgeClass = listColor[ls.color] ?? listColor.GRAY;

              return (
                <li key={ls.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setTargetListId(ls.id)}
                    onFocus={() => setTargetListId(ls.id)}
                    onClick={() => handleSelect(ls.id)}
                    disabled={isUpdateTaskNewLoading}
                    role="menuitemradio"
                    aria-checked={selected}
                    className={`w-full flex items-center justify-between rounded-sm px-2 py-1.5 text-sm
                                hover:bg-black/10 dark:hover:bg-white/10
                                ${selected ? "font-medium" : ""}`}
                  >
                    <span className="flex items-center gap-2">
                      <Badge className={badgeClass}>{ls.name}</Badge>
                    </span>
                    {selected ? <Check size={14} /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>

      <div className="mt-1 ml-8 flex gap-1">
        <Badge className={listColor[colorKey]}>{statusLabel}</Badge>
      </div>
    </div>
  );
}
